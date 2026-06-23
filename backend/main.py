from fastapi import FastAPI, Form, UploadFile, File, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import io
import uuid
from PIL import Image
from pydantic import BaseModel

load_dotenv()

from orchestrator import Orchestrator
from db.database import get_db, init_db
from db import crud
from db.models import User
from publishers.imagekit_uploader import ImageKitUploader
from publishers.shopify_publisher import ShopifyPublisher
from agents.rag_agent import RAGAgent
from auth_utils import get_password_hash, verify_password, create_access_token, decode_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = await crud.get_user_by_id(db, uuid.UUID(user_id))
    if user is None:
        raise credentials_exception
    return user


# ── Lifespan (runs DB init on startup) ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Verion AI",
    description="Privacy-First Multi-Agent Platform with Platform Integrations",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()
imagekit = ImageKitUploader()


# ── Schemas ────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ShopifyConnectionRequest(BaseModel):
    shop_domain: str
    access_token: str


class PublishRequest(BaseModel):
    platform: str                      # 'shopify' | 'amazon'
    title: str
    description: str
    tags: List[str] = []
    price: str = "0.00"
    image_urls: List[str] = []         # already-uploaded ImageKit URLs
    vendor: str = "Verion AI"          # Store vendor
    quantity: Optional[int] = None     # Inventory units
    # ── Metafields from SEO agent ──
    color: Optional[str] = None
    condition: Optional[str] = None
    weight: Optional[str] = None
    brand: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    category: Optional[str] = None
    product_type: str = ""
    specs: Optional[dict] = None       # Free-form spec k/v pairs


# ── Auth Routes ────────────────────────────────────────────────────────────────
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate, db = Depends(get_db)):
    db_user = await crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = await crud.create_user(db=db, email=user.email, name=user.name, hashed_password=hashed_password)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id), "name": new_user.name}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    user = await crud.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "name": user.name}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ── Core Generate Route ────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "Verion AI API is running"}


@app.post("/api/generate")
async def generate_listing(
    raw_description: str = Form(...),
    platform: str = Form("olx"),
    images: Optional[List[UploadFile]] = File(None),
):
    pil_images = []
    if images:
        for img_file in images:
            contents = await img_file.read()
            try:
                pil_images.append(Image.open(io.BytesIO(contents)))
            except Exception:
                pass

    result = orchestrator.process_request(
        raw_input=raw_description,
        images=pil_images if pil_images else None,
        platform=platform,
    )
    return result


# ── Image Upload Route (ImageKit) ──────────────────────────────────────────────
@app.post("/api/upload-images")
async def upload_images(images: List[UploadFile] = File(...)):
    """
    Upload images to ImageKit and return their public CDN URLs.
    Call this after generating a listing to get URLs ready for publishing.
    """
    pil_images = []
    for img_file in images:
        contents = await img_file.read()
        try:
            pil_images.append(Image.open(io.BytesIO(contents)))
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid image: {img_file.filename}")

    try:
        urls = imagekit.upload_multiple(pil_images)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {"status": "success", "image_urls": urls}


# ── Platform Connection Routes ─────────────────────────────────────────────────
@app.post("/api/connections/shopify")
async def connect_shopify(body: ShopifyConnectionRequest, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """Save (or update) Shopify credentials for this user."""
    # Verify the credentials work before saving
    publisher = ShopifyPublisher(body.shop_domain, body.access_token)
    if not publisher.test_connection():
        raise HTTPException(
            status_code=401,
            detail="Could not connect to Shopify. Please check your shop domain and access token.",
        )

    conn = await crud.upsert_connection(
        db,
        user_id=current_user.id,
        platform="shopify",
        shop_domain=body.shop_domain,
        access_token=body.access_token,
    )
    return {
        "status": "connected",
        "platform": "shopify",
        "shop_domain": conn.shop_domain,
        "id": str(conn.id),
    }


@app.get("/api/connections")
async def list_connections(db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all saved platform connections for the current user."""
    conns = await crud.list_connections(db, current_user.id)
    return [
        {
            "id": str(c.id),
            "platform": c.platform,
            "shop_domain": c.shop_domain,
            "connected_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in conns
    ]


@app.delete("/api/connections/{connection_id}")
async def delete_connection(connection_id: uuid.UUID, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = await crud.delete_connection(db, current_user.id, connection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connection not found.")
    return {"status": "deleted"}


# ── Publish Route ──────────────────────────────────────────────────────────────
@app.post("/api/publish")
async def publish_listing(body: PublishRequest, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Publish a generated listing to the specified platform.
    The listing data comes from a previous /api/generate call.
    """
    if body.platform == "shopify":
        conn = await crud.get_connection(db, current_user.id, "shopify")
        shop_domain = conn.shop_domain if conn else os.environ.get("SHOPIFY_SHOP_DOMAIN")
        access_token = conn.access_token if conn else os.environ.get("SHOPIFY_ACCESS_TOKEN")

        if not shop_domain or not access_token:
            raise HTTPException(
                status_code=404,
                detail="No Shopify connection found. Please connect your store or set env vars.",
            )

        publisher = ShopifyPublisher(shop_domain, access_token)
        try:
            result = publisher.publish_product(
                title=body.title,
                body_html=f"<p>{body.description}</p>",
                tags=body.tags,
                price=body.price,
                image_urls=body.image_urls,
                vendor=body.vendor,
                quantity=body.quantity,
                product_type=body.product_type,
                color=body.color,
                condition=body.condition,
                weight=body.weight,
                brand=body.brand,
                material=body.material,
                dimensions=body.dimensions,
                category=body.category,
                specs=body.specs,
            )
        except RuntimeError as e:
            raise HTTPException(status_code=502, detail=str(e))

        return {"status": "published", "platform": "shopify", "result": result}

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Publishing to '{body.platform}' is not yet supported. Currently available: shopify",
        )

# ── Stats & Data Routes ────────────────────────────────────────────────────────
@app.get("/api/stats")
async def get_stats():
    """Return mock metrics and actual ChromaDB document count."""
    try:
        rag = RAGAgent()
        count = rag.vector_store._collection.count()
    except Exception:
        count = 0

    return {
        "rag_documents": count,
        "avg_seo_score_increase": "10%",
        "time_saved_per_listing": "45 mins",
        "recent_optimizations": 124
    }

@app.get("/api/products")
async def fetch_shopify_products(db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch existing products from the connected Shopify store."""
    conn = await crud.get_connection(db, current_user.id, "shopify")
    shop_domain = conn.shop_domain if conn else os.environ.get("SHOPIFY_SHOP_DOMAIN")
    access_token = conn.access_token if conn else os.environ.get("SHOPIFY_ACCESS_TOKEN")

    if not shop_domain or not access_token:
        raise HTTPException(status_code=404, detail="Shopify not connected.")
    
    import httpx
    try:
        url = f"https://{shop_domain}/admin/api/2024-01/products.json?limit=10"
        headers = {
            "X-Shopify-Access-Token": access_token,
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Format product data
            formatted_products = []
            for p in data.get("products", []):
                image_url = p.get("image", {}).get("src") if p.get("image") else None
                formatted_products.append({
                    "id": str(p["id"]),
                    "title": p["title"],
                    "description": p.get("body_html", ""),
                    "image": image_url,
                    "status": p.get("status")
                })
            return {"status": "success", "products": formatted_products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

