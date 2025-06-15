from fastapi import FastAPI
from src.presentation.api.api_v1.users.auth import router as auth_router
from src.presentation.api.api_v1.appointments.appointment_router import router as appointment_router

def apply_routes(app: FastAPI) -> FastAPI:

    app.include_router(auth_router)
    app.include_router(appointment_router)

    return app
