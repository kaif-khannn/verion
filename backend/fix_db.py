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
            # Try to add the name column
            await conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(255);"))
            print("Successfully added name column.")
        except Exception as e:
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    asyncio.run(fix_schema())
