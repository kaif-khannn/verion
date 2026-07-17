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
from datetime import datetime, timedelta
import random

load_dotenv(override=True)

from orchestrator import Orchestrator
from db.database import get_db, init_db
from db import crud
from db.models import User
from publishers.imagekit_uploader import ImageKitUploader
from publishers.shopify_publisher import ShopifyPublisher
from publishers.woocommerce_publisher import WooCommercePublisher
from agents.rag_agent import RAGAgent
from agents.analytics_agent import AnalyticsAgent
from agents.trend_agent import TrendAgent
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
    preferred_niches: Optional[List[str]] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ShopifyConnectionRequest(BaseModel):
    shop_domain: str
    access_token: str

class WooCommerceConnectionRequest(BaseModel):
    shop_url: str
    consumer_key: str
    consumer_secret: str


class PublishRequest(BaseModel):
    platform: str                      # 'shopify' | 'woocommerce'
    title: str
    description: str
    tags: List[str] = []
    price: str = "0.00"
    sale_price: Optional[str] = None
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

class ExperimentStartRequest(BaseModel):
    platform: str
    product_id: str
    variants: List[dict] # The scored variants array

class SimulationRequest(BaseModel):
    variants: List[dict]

class TrendDetailRequest(BaseModel):
    category: str
    description: str



# ── Auth Routes ────────────────────────────────────────────────────────────────
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate, db = Depends(get_db)):
    db_user = await crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    
    import json
    niches_str = json.dumps(user.preferred_niches) if user.preferred_niches else None
    
    new_user = await crud.create_user(
        db=db, 
        email=user.email, 
        name=user.name, 
        hashed_password=hashed_password,
        preferred_niches=niches_str
    )
    
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

@app.get("/api/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    import json
    niches = []
    if current_user.preferred_niches:
        try:
            niches = json.loads(current_user.preferred_niches)
        except Exception:
            pass
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "preferred_niches": niches
    }

# ── Core Generate Route ────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "Verion AI API is running"}


@app.post("/api/generate")
async def generate_listing(
    raw_description: str = Form(...),
    platform: str = Form("olx"),
    images: Optional[List[UploadFile]] = File(None),
    image_url: Optional[str] = Form(None),
):
    pil_images = []
    if images:
        for img_file in images:
            contents = await img_file.read()
            try:
                pil_images.append(Image.open(io.BytesIO(contents)))
            except Exception:
                pass

    if image_url:
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(image_url)
                if resp.status_code == 200:
                    pil_images.append(Image.open(io.BytesIO(resp.content)))
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

@app.post("/api/connections/woocommerce")
async def connect_woocommerce(body: WooCommerceConnectionRequest, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """Save (or update) WooCommerce credentials for this user."""
    publisher = WooCommercePublisher(body.shop_url, body.consumer_key, body.consumer_secret)
    if not publisher.test_connection():
        raise HTTPException(
            status_code=401,
            detail="Could not connect to WooCommerce. Please check your URL and keys.",
        )

    # Reusing shop_domain for the shop URL, but saving specific keys
    conn = await crud.upsert_connection(
        db,
        user_id=current_user.id,
        platform="woocommerce",
        shop_domain=body.shop_url,
    )
    
    # Store keys in the newly added database columns
    conn.woo_consumer_key = body.consumer_key
    conn.woo_consumer_secret = body.consumer_secret
    db.add(conn)
    await db.commit()

    return {
        "status": "connected",
        "platform": "woocommerce",
        "shop_domain": conn.shop_domain,
        "id": str(conn.id),
    }


@app.get("/api/connections")
async def list_connections(db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all saved platform connections for the current user."""
    conns = await crud.list_connections(db, current_user.id)
    result = [
        {
            "id": str(c.id),
            "platform": c.platform,
            "shop_domain": c.shop_domain,
            "connected_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in conns
    ]
    
    # Fallback to .env for Shopify if no DB connection exists
    if not any(c["platform"] == "shopify" for c in result):
        env_domain = os.environ.get("SHOPIFY_SHOP_DOMAIN")
        env_token = os.environ.get("SHOPIFY_ACCESS_TOKEN")
        if env_domain and env_token:
            result.append({
                "id": "00000000-0000-0000-0000-000000000000",
                "platform": "shopify",
                "shop_domain": env_domain,
                "connected_at": None,
            })
            
    return result


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

    elif body.platform == "woocommerce":
        conn = await crud.get_connection(db, current_user.id, "woocommerce")
        if not conn or not conn.woo_consumer_key or not conn.woo_consumer_secret:
            raise HTTPException(
                status_code=404,
                detail="No WooCommerce connection found. Please connect your store.",
            )

        publisher = WooCommercePublisher(conn.shop_domain, conn.woo_consumer_key, conn.woo_consumer_secret)
        
        # Combine all metafields into meta_data
        meta_data = body.specs or {}
        for k in ['color', 'condition', 'weight', 'brand', 'material', 'dimensions']:
            v = getattr(body, k)
            if v:
                meta_data[k] = v

        try:
            result = publisher.publish_product(
                title=body.title,
                description=body.description,
                regular_price=body.price,
                sale_price=body.sale_price,
                tags=body.tags,
                categories=[body.category] if body.category else [],
                image_urls=body.image_urls,
                quantity=body.quantity,
                meta_data=meta_data,
            )
        except RuntimeError as e:
            raise HTTPException(status_code=502, detail=str(e))

        return {"status": "published", "platform": "woocommerce", "result": result}

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Publishing to '{body.platform}' is not yet supported.",
        )

# ── Experiment Routes (COPE) ───────────────────────────────────────────────────
@app.post("/api/experiments/start")
async def start_experiment(body: ExperimentStartRequest, db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Start an autonomous A/B test with the COPE Decision Engine.
    Creates an experiment record and saves variant performance baselines.
    """
    import json
    
    experiment = await crud.create_experiment(
        db, 
        user_id=current_user.id, 
        platform=body.platform, 
        product_id=body.product_id
    )
    
    # Save the variants being tested
    for variant in body.variants:
        scores = variant.get("cope_scores", {})
        await crud.add_variant_performance(
            db,
            experiment_id=experiment.id,
            variant_id=variant.get("variant_id"),
            content_blob=json.dumps(variant),
            predicted_ctr=str(scores.get("expected_ctr", "0")),
            predicted_conversion_prob=str(scores.get("purchase_probability", "0"))
        )
        
    return {"status": "success", "experiment_id": str(experiment.id), "message": "A/B test initialized."}

@app.post("/api/experiments/simulate")
async def simulate_experiment(body: SimulationRequest, current_user: User = Depends(get_current_user)):
    from agents.prediction_engine import PredictionEngine
    engine = PredictionEngine()
    result = engine.run_synthetic_simulation(body.variants)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return {"status": "success", "data": result}

@app.get("/api/experiments/active")
async def get_active_experiments(db=Depends(get_db), current_user: User = Depends(get_current_user)):
    experiments = await crud.get_active_experiments(db, current_user.id)
    return {"status": "success", "experiments": [{"id": str(e.id), "platform": e.platform, "product_id": e.product_id} for e in experiments]}



# ── Stats & Data Routes ────────────────────────────────────────────────────────
@app.get("/api/insights/trends")
async def get_trends(niche: str):
    agent = TrendAgent()
    trends_data = agent.get_trending_products(niche)
    return {"status": "success", "data": trends_data}

@app.post("/api/insights/trend-details")
async def get_trend_details(body: TrendDetailRequest):
    agent = TrendAgent()
    insights = agent.analyze_trend(body.category, body.description)
    return {"status": "success", "insights": insights}
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

@app.get("/api/analytics")
async def get_analytics():
    """Return historical chart data and AI-generated insights."""
    try:
        rag = RAGAgent()
        count = rag.vector_store._collection.count()
    except Exception:
        count = 0

    current_stats = {
        "rag_documents": count,
        "avg_seo_score_increase": "10%",
        "time_saved_per_listing": "45 mins",
        "recent_optimizations": 124
    }

    # Generate mock chart data for the last 7 days
    chart_data = []
    base_optimizations = 10
    base_seo = 70
    for i in range(6, -1, -1):
        date_str = (datetime.now() - timedelta(days=i)).strftime("%b %d")
        chart_data.append({
            "date": date_str,
            "optimizations": base_optimizations + random.randint(-2, 5),
            "seo_score": min(100, base_seo + random.randint(0, 10))
        })
        base_optimizations += random.randint(0, 3)
        base_seo += random.randint(0, 2)

    agent = AnalyticsAgent()
    insights = agent.generate_insights(chart_data, current_stats)

    return {
        "chart_data": chart_data,
        "insights": insights
    }

@app.get("/api/products")
async def fetch_products(platform: str = "shopify", db=Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch existing products from the connected store."""
    import httpx

    if platform == "shopify":
        conn = await crud.get_connection(db, current_user.id, "shopify")
        shop_domain = conn.shop_domain if conn else os.environ.get("SHOPIFY_SHOP_DOMAIN")
        access_token = conn.access_token if conn else os.environ.get("SHOPIFY_ACCESS_TOKEN")

        if not shop_domain or not access_token:
            raise HTTPException(status_code=404, detail="Shopify not connected.")
        
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
            
    elif platform == "woocommerce":
        conn = await crud.get_connection(db, current_user.id, "woocommerce")
        if not conn or not conn.woo_consumer_key or not conn.woo_consumer_secret:
            raise HTTPException(status_code=404, detail="WooCommerce not connected.")
            
        try:
            url = f"{conn.shop_domain}/wp-json/wc/v3/products?per_page=10"
            async with httpx.AsyncClient() as client:
                params = {
                    "consumer_key": conn.woo_consumer_key,
                    "consumer_secret": conn.woo_consumer_secret
                }
                response = await client.get(url, auth=(conn.woo_consumer_key, conn.woo_consumer_secret), params=params)
                response.raise_for_status()
                data = response.json()
                
                formatted_products = []
                for p in data:
                    image_url = p.get("images", [{}])[0].get("src") if p.get("images") else None
                    formatted_products.append({
                        "id": str(p["id"]),
                        "title": p["name"],
                        "description": p.get("description", ""),
                        "image": image_url,
                        "status": p.get("status")
                    })
                return {"status": "success", "products": formatted_products}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Invalid platform specified")

