import httpx
from typing import Optional, List

class WooCommercePublisher:
    """
    WooCommerce Publisher
    ---------------------
    Publishes products to WooCommerce using the REST API (v3).
    Maps tags, categories, regular price, sale price, and custom metadata.
    """

    def __init__(self, shop_url: str, consumer_key: str, consumer_secret: str):
        self.shop_url = shop_url.strip().rstrip("/")
        self.auth = (consumer_key, consumer_secret)
        self.base_url = f"{self.shop_url}/wp-json/wc/v3"
        self.headers = {
            "Content-Type": "application/json",
        }

    def publish_product(
        self,
        title: str,
        description: str,
        regular_price: str = "0.00",
        sale_price: Optional[str] = None,
        tags: List[str] = None,
        categories: List[str] = None,
        image_urls: List[str] = None,
        quantity: Optional[int] = None,
        meta_data: Optional[dict] = None,
    ) -> dict:
        """
        Create a new product on WooCommerce.
        """
        # Convert tags/categories to WooCommerce format if provided
        # Note: In a real app, these might need to be created first or referenced by ID.
        # But WooCommerce API allows creating tags by name sometimes or we can just pass them as attributes if strict.
        # For simplicity, we'll try to map them to meta_data if we don't have IDs, or attempt to pass them directly.
        
        payload = {
            "name": title,
            "type": "simple",
            "regular_price": str(regular_price),
            "description": description,
            "short_description": description[:150] + "..." if len(description) > 150 else description,
            "status": "draft",
        }

        if sale_price and sale_price.strip() and float(sale_price) > 0:
            payload["sale_price"] = str(sale_price)

        if quantity is not None:
            payload["manage_stock"] = True
            payload["stock_quantity"] = quantity

        if image_urls:
            payload["images"] = [{"src": url} for url in image_urls]

        # Convert meta_data to WooCommerce format
        wc_meta_data = []
        if meta_data:
            for k, v in meta_data.items():
                if v:
                    wc_meta_data.append({"key": k, "value": str(v)})
        
        # We can also store tags and categories as meta data to ensure they are saved,
        # or we could try to look up their IDs. Storing as meta data is safer if IDs are unknown.
        if tags:
            wc_meta_data.append({"key": "_verion_tags", "value": ", ".join(tags)})
        if categories:
            wc_meta_data.append({"key": "_verion_categories", "value": " > ".join(categories)})

        if wc_meta_data:
            payload["meta_data"] = wc_meta_data

        response = httpx.post(
            f"{self.base_url}/products",
            auth=self.auth,
            headers=self.headers,
            json=payload,
            timeout=30,
        )

        if response.status_code not in (200, 201):
            raise RuntimeError(
                f"WooCommerce API error [{response.status_code}]: {response.text}"
            )

        product = response.json()
        product_id = product.get("id")
        permalink = product.get("permalink")

        return {
            "woocommerce_product_id": product_id,
            "title": product.get("name"),
            "status": product.get("status"),
            "admin_url": f"{self.shop_url}/wp-admin/post.php?post={product_id}&action=edit",
            "permalink": permalink,
            "meta_data_count": len(wc_meta_data),
        }

    def test_connection(self) -> bool:
        """Ping WooCommerce to verify credentials."""
        try:
            r = httpx.get(
                f"{self.base_url}/system_status",
                auth=self.auth,
                headers=self.headers,
                timeout=10,
            )
            return r.status_code == 200
        except Exception:
            return False
