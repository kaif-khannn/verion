"""
Shopify Publisher
-----------------
Creates a product listing on Shopify using the Admin REST API.
Supports product metafields and category metafields for fully-detailed listings.

Setup guide:
  1. Go to your Shopify Admin → Apps → Develop apps → Create an app
  2. Configure "Admin API scopes": enable `write_products`, `read_products`
  3. Install the app → copy the "Admin API access token" (shpat_…)
  4. Set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com and
     SHOPIFY_ACCESS_TOKEN=shpat_… in your .env

Docs: https://shopify.dev/docs/api/admin-rest/2025-01/resources/product
      https://shopify.dev/docs/api/admin-rest/2025-01/resources/metafield
"""

import httpx
from typing import Optional


class ShopifyPublisher:

    API_VERSION = "2025-01"

    def __init__(self, shop_domain: str, access_token: str):
        self.shop_domain  = shop_domain.strip().rstrip("/")
        self.access_token = access_token
        self.base_url     = f"https://{self.shop_domain}/admin/api/{self.API_VERSION}"
        self.headers = {
            "X-Shopify-Access-Token": self.access_token,
            "Content-Type": "application/json",
        }

    # ── Public API ──────────────────────────────────────────────────

    def publish_product(
        self,
        title: str,
        body_html: str,
        vendor: str = "Verion AI",
        product_type: str = "",
        tags: list[str] | None = None,
        price: str = "0.00",
        image_urls: list[str] | None = None,
        quantity: Optional[int] = None,
        # ── Metafield-able attributes ──
        color: Optional[str] = None,
        condition: Optional[str] = None,
        weight: Optional[str] = None,
        brand: Optional[str] = None,
        material: Optional[str] = None,
        dimensions: Optional[str] = None,
        category: Optional[str] = None,
        specs: Optional[dict] = None,
    ) -> dict:
        """
        Create a new product on Shopify as a Draft with full metafields.
        Raises RuntimeError if the API call fails.
        """
        images   = [{"src": url} for url in (image_urls or [])]
        tags_str = ", ".join(tags or [])

        # ── Build inline metafields list ──────────────────────────────
        # Namespace "product_info" for standard attributes
        # Namespace "custom" for free-form specs
        inline_metafields = []

        def _mf(key: str, value: str, namespace: str = "custom", value_type: str = "single_line_text_field"):
            if value:
                inline_metafields.append({
                    "namespace": namespace,
                    "key": key,
                    "value": str(value),
                    "type": value_type,
                })

        _mf("color",      color)
        _mf("condition",  condition)
        _mf("weight",     weight)
        _mf("brand",      brand)
        _mf("material",   material)
        _mf("dimensions", dimensions)
        _mf("category",   category)

        # Add each spec key-value pair under the "custom" namespace
        if specs and isinstance(specs, dict):
            for spec_key, spec_val in specs.items():
                if spec_val and str(spec_val).lower() not in ("null", "none", "unknown", ""):
                    # Sanitize key: lowercase, underscores
                    safe_key = spec_key.lower().replace(" ", "_").replace("-", "_")[:30]
                    _mf(safe_key, str(spec_val))

        payload = {
            "product": {
                "title":        title,
                "body_html":    body_html,
                "vendor":       vendor,
                "product_type": product_type,
                "tags":         tags_str,
                "status":       "draft",
                "variants": [
                    {
                        "price":                price,
                        "inventory_management": "shopify" if quantity is not None else None,
                        **( {"inventory_quantity": quantity} if quantity is not None else {} ),
                    }
                ],
                "images":     images,
                "metafields": inline_metafields,
            }
        }

        response = httpx.post(
            f"{self.base_url}/products.json",
            headers=self.headers,
            json=payload,
            timeout=30,
        )

        if response.status_code not in (200, 201):
            raise RuntimeError(
                f"Shopify API error [{response.status_code}]: {response.text}"
            )

        product   = response.json().get("product", {})
        product_id = product.get("id", "")
        shop_url  = f"https://{self.shop_domain}/admin/products/{product_id}"

        return {
            "shopify_product_id": product_id,
            "title":      product.get("title"),
            "status":     product.get("status"),
            "admin_url":  shop_url,
            "handle":     product.get("handle"),
            "metafields_count": len(inline_metafields),
        }

    def test_connection(self) -> bool:
        """Ping the Shopify shop endpoint to verify credentials."""
        try:
            r = httpx.get(
                f"{self.base_url}/shop.json",
                headers=self.headers,
                timeout=10,
            )
            return r.status_code == 200
        except Exception:
            return False
