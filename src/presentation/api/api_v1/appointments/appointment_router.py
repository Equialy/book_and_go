import logging

from fastapi import APIRouter, Depends, Form

from src.domain.appointments.schemas.appointment import AppointmentsSchema, AppointmentsSchemaBase
from src.presentation.dependencies.appointments.appointments_di import AppointmentsService
from src.settings import settings

log = logging.getLogger(__name__)

router = APIRouter(prefix=settings.api.v1.prefix + settings.api.v1.panel, tags=["Panel Manager"])


@router.get("/appointments", response_model=list[AppointmentsSchemaBase])
async def all_appointments(appointment_service: AppointmentsService) -> list[AppointmentsSchemaBase]:
    return await appointment_service.get_all_appointment()


@router.post("/appointments", response_model=AppointmentsSchemaBase)
async def create_appointments(appointment_model: AppointmentsSchema,
                              appointment_service: AppointmentsService) -> AppointmentsSchemaBase:
    return await appointment_service.create_appointment(appointment_model)


@router.delete("/appointments", response_model=AppointmentsSchemaBase)
async def delete_appointments(appointment_model: int,
                              appointment_service: AppointmentsService) -> AppointmentsSchemaBase:
    return await appointment_service.delete_appointment(appointment=appointment_model)
