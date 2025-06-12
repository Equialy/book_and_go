import uvicorn
from fastapi import FastAPI

import logging

from src.exceptions.exceptions_handlers import register_exceptions_hanlder
from src.middleware import apply_middleware
from src.presentation.routers import apply_routes
from src.settings import config_logging


def create_app() -> FastAPI:
    config_logging(level=logging.INFO)
    app = FastAPI(
        docs_url='/docs',
        openapi_url='/docs.json',
    )
    app = apply_routes(apply_middleware(app))
    register_exceptions_hanlder(app)
    return app


app = create_app()

if __name__ == '__main__':
    uvicorn.run('src.presentation.main:app', port=8000, reload=False)
