import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def fix_schema():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        from sqlalchemy import text
        try:
            await conn.execute(text("ALTER TABLE platform_connections ADD COLUMN woo_consumer_key TEXT;"))
            await conn.execute(text("ALTER TABLE platform_connections ADD COLUMN woo_consumer_secret TEXT;"))
            print("Successfully added WooCommerce columns.")
        except Exception as e:
            print(f"Error adding columns: {e}")

if __name__ == "__main__":
    asyncio.run(fix_schema())
