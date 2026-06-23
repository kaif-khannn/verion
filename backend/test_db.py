
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    try:
        engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/verion_ai')
        async with engine.begin() as conn:
            print('DB connection successful!')
    except Exception as e:
        print('DB connection failed:', e)

asyncio.run(main())

