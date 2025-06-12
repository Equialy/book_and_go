from fastapi import FastAPI
from src.presentation.api.api_v1.library.routers import router as books_router
from src.presentation.api.api_v1.users.auth import router as auth_router
from src.presentation.api.api_v1.readers.readers_router import router as readers_router
from src.presentation.api.api_v1.borrows.borrow_router import router as borrow_router
from src.presentation.api.api_v1.info_books.info_router import router as info_router

def apply_routes(app: FastAPI) -> FastAPI:

    app.include_router(books_router)
    app.include_router(auth_router)
    app.include_router(readers_router)
    app.include_router(borrow_router)
    app.include_router(info_router)

    return app
