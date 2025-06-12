import asyncio
from typing import AsyncGenerator

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker



@pytest.fixture(scope='session', autouse=True)
async def prepare_database():
    engine = create_async_engine(settings.test_db.url_db_test)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(settings.test_db.url_db_test)
    async with engine.connect() as connection:
        await connection.begin()

        async_session = async_sessionmaker(
            bind=connection,
            expire_on_commit=False,
            autoflush=False,
            future=True
        )

        async with async_session() as session:
            try:
                yield session
            finally:
                await connection.rollback()
        await connection.close()
    await engine.dispose()


@pytest.fixture(scope="function")
async def ac_client(session: AsyncSession):
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield session

    app.dependency_overrides[get_async_session] = override_get_session
    async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()