import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def alter_table():
    db_url = os.getenv("DATABASE_URL")
    # Convert postgresql+asyncpg:// to postgres:// for asyncpg connect if needed, but asyncpg connect works with postgresql://
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    print(f"Connecting to {db_url}")
    conn = await asyncpg.connect(db_url)
    try:
        await conn.execute("ALTER TABLE users ADD COLUMN preferred_niches TEXT")
        print("Successfully added preferred_niches column.")
    except Exception as e:
        print(f"Error (maybe column exists?): {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(alter_table())
