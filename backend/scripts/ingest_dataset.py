"""
RAG Dataset Ingestion Script
─────────────────────────────
Loads e-commerce product datasets from Hugging Face directly into ChromaDB.

Supported sources:
  1. Shopify/product-catalogue   (brand, category, description)
  2. McAuley-Lab/Amazon-Reviews-2023  (title, price, description, brand, category)
  3. Any local CSV file  (fallback)

Usage:
  python scripts/ingest_dataset.py --source shopify --rows 500
  python scripts/ingest_dataset.py --source amazon --rows 500
  python scripts/ingest_dataset.py --source csv --csv-path data/products.csv --rows 200
  python scripts/ingest_dataset.py --source all --rows 300   # loads both HF datasets
"""

import os
import sys
import argparse

# Ensure we can import from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from langchain_core.documents import Document
from agents.rag_agent import RAGAgent


def _get_rag_agent():
    agent = RAGAgent()
    if not agent.vector_store:
        print("❌ Error: Could not initialize RAG Agent. Check your GEMINI_API_KEY in .env")
        sys.exit(1)
    return agent


# ── Shopify/product-catalogue ─────────────────────────────────────────────────
def ingest_shopify(max_rows: int = 500):
    """Load the Shopify/product-catalogue dataset from Hugging Face."""
    from datasets import load_dataset

    print("📦 Loading Shopify/product-catalogue from Hugging Face...")
    ds = load_dataset("Shopify/product-catalogue", split="train", trust_remote_code=True)

    rag = _get_rag_agent()
    docs = []
    count = 0

    for row in ds:
        if count >= max_rows:
            break

        desc = str(row.get("description", "") or "")
        if not desc.strip():
            continue

        brand    = str(row.get("brand", "") or "Unknown")
        category = str(row.get("category", "") or "General")
        is_used  = row.get("is_secondhand", False)

        metadata = {
            "product_name": desc[:120],  # first 120 chars as a short name
            "brand":           brand,
            "retail_price":    "Unknown",  # Shopify dataset doesn't have price
            "discounted_price":"Unknown",
            "category":        category,
            "condition":       "Used / Secondhand" if is_used else "New",
            "source":          "shopify_catalogue",
        }

        page_content = f"[{brand}] {desc}\nCategory: {category}"
        docs.append(Document(page_content=page_content, metadata=metadata))
        count += 1

    print(f"📥 Adding {len(docs)} Shopify products to ChromaDB...")
    rag.vector_store.add_documents(docs)
    print(f"✅ Shopify ingestion complete ({len(docs)} products).\n")
    return len(docs)


# ── Amazon Products (McAuley-Lab) ──────────────────────────────────────────────
def ingest_amazon(max_rows: int = 500):
    """Load Amazon product metadata from McAuley-Lab/Amazon-Reviews-2023."""
    from datasets import load_dataset

    print("📦 Loading McAuley-Lab/Amazon-Reviews-2023 (raw meta, 'All_Beauty' subset)...")
    print("   (This may take a minute on first download)")

    try:
        ds = load_dataset(
            "McAuley-Lab/Amazon-Reviews-2023",
            "raw_meta_All_Beauty",
            split="full",
            trust_remote_code=True,
        )
    except Exception as e:
        print(f"⚠️  Could not load Amazon dataset: {e}")
        print("   Trying fallback: cvnberk/amazon-products ...")
        return ingest_amazon_fallback(max_rows)

    rag = _get_rag_agent()
    docs = []
    count = 0

    for row in ds:
        if count >= max_rows:
            break

        title = str(row.get("title", "") or "")
        desc  = str(row.get("description", "") or "")
        if not title.strip() and not desc.strip():
            continue

        # Price handling — can be a string like "$19.99" or a dict
        price_raw = row.get("price", "")
        if isinstance(price_raw, (list, dict)):
            price_raw = ""
        price = str(price_raw).replace("$", "").replace(",", "").strip() or "Unknown"

        brand = ""
        details = row.get("details", {})
        if isinstance(details, dict):
            brand = details.get("Brand", details.get("brand", ""))
        if not brand:
            brand = str(row.get("brand", "") or "Unknown")

        categories = row.get("categories", [])
        category = " > ".join(categories) if isinstance(categories, list) and categories else "General"

        metadata = {
            "product_name":    title[:150] or desc[:150],
            "brand":           str(brand),
            "retail_price":    price,
            "discounted_price":"Unknown",
            "category":        category,
            "condition":       "New",
            "source":          "amazon_mcauley",
        }

        page_content = f"{title}\n{desc}\nBrand: {brand} | Price: ${price} | Category: {category}"
        docs.append(Document(page_content=page_content, metadata=metadata))
        count += 1

    print(f"📥 Adding {len(docs)} Amazon products to ChromaDB...")
    rag.vector_store.add_documents(docs)
    print(f"✅ Amazon ingestion complete ({len(docs)} products).\n")
    return len(docs)


def ingest_amazon_fallback(max_rows: int = 500):
    """Fallback: Load cvnberk/amazon-products."""
    from datasets import load_dataset

    print("📦 Loading cvnberk/amazon-products from Hugging Face...")
    ds = load_dataset("cvnberk/amazon-products", split="train", trust_remote_code=True)

    rag = _get_rag_agent()
    docs = []
    count = 0

    for row in ds:
        if count >= max_rows:
            break

        title = str(row.get("Product Name", row.get("title", "")) or "")
        desc  = str(row.get("About Product", row.get("description", "")) or "")
        if not title.strip() and not desc.strip():
            continue

        price = str(row.get("Selling Price", row.get("price", "")) or "Unknown")
        price = price.replace("$", "").replace("₹", "").replace(",", "").strip() or "Unknown"

        brand    = str(row.get("Brand", row.get("brand", "")) or "Unknown")
        category = str(row.get("Category", row.get("category", "")) or "General")

        metadata = {
            "product_name":    title[:150] or desc[:150],
            "brand":           brand,
            "retail_price":    price,
            "discounted_price":"Unknown",
            "category":        category,
            "condition":       "New",
            "source":          "amazon_cvnberk",
        }

        page_content = f"{title}\n{desc}\nBrand: {brand} | Price: ${price} | Category: {category}"
        docs.append(Document(page_content=page_content, metadata=metadata))
        count += 1

    print(f"📥 Adding {len(docs)} Amazon (fallback) products to ChromaDB...")
    rag.vector_store.add_documents(docs)
    print(f"✅ Amazon (fallback) ingestion complete ({len(docs)} products).\n")
    return len(docs)


# ── CSV fallback ───────────────────────────────────────────────────────────────
def ingest_csv(csv_path: str, max_rows: int = 200):
    """Load a generic CSV product dataset into ChromaDB."""
    import pandas as pd

    if not os.path.exists(csv_path):
        print(f"❌ Error: Could not find {csv_path}")
        return 0

    print(f"📦 Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=[df.columns[0]]).head(max_rows)

    rag = _get_rag_agent()
    docs = []

    for _, row in df.iterrows():
        name  = str(row.get("product_name", row.get("title", row.get("Product Name", "Unknown"))))
        desc  = str(row.get("description", row.get("About Product", "")))
        brand = str(row.get("brand", row.get("Brand", "Unknown")))
        price = str(row.get("retail_price", row.get("price", row.get("Selling Price", "Unknown"))))
        disc  = str(row.get("discounted_price", "Unknown"))

        metadata = {
            "product_name":    name[:150],
            "brand":           brand,
            "retail_price":    price,
            "discounted_price":disc,
            "source":          "csv",
        }

        page_content = f"{name}\n{desc}"
        docs.append(Document(page_content=page_content, metadata=metadata))

    print(f"📥 Adding {len(docs)} products from CSV to ChromaDB...")
    rag.vector_store.add_documents(docs)
    print(f"✅ CSV ingestion complete ({len(docs)} products).\n")
    return len(docs)


# ── Main ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest e-commerce datasets into ChromaDB for RAG")
    parser.add_argument(
        "--source",
        choices=["shopify", "amazon", "csv", "all"],
        default="all",
        help="Which dataset to ingest (default: all)",
    )
    parser.add_argument("--rows", type=int, default=500, help="Max rows per dataset (default: 500)")
    parser.add_argument("--csv-path", type=str, default="", help="Path to CSV file (only for --source csv)")
    args = parser.parse_args()

    total = 0
    print("=" * 60)
    print("   Verion AI — RAG Dataset Ingestion")
    print("=" * 60)

    if args.source in ("shopify", "all"):
        total += ingest_shopify(args.rows)

    if args.source in ("amazon", "all"):
        total += ingest_amazon(args.rows)

    if args.source == "csv":
        if not args.csv_path:
            print("❌ Please provide --csv-path when using --source csv")
            sys.exit(1)
        total += ingest_csv(args.csv_path, args.rows)

    print("=" * 60)
    print(f"🎉 Done! Total products ingested: {total}")
    print(f"   ChromaDB location: backend/chroma_db/")
    print("=" * 60)
