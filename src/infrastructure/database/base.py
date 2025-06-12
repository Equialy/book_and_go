from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from src.settings import settings



DB_URL = settings.db.url_db


asyncio_engine = create_async_engine(
    DB_URL
)

AsyncSessionFactory = async_sessionmaker(
    asyncio_engine,
    autocommit=False,
    expire_on_commit=False,
    future=True,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()


Session = Annotated[AsyncSession, Depends(get_async_session)]
