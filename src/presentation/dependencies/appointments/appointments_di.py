import logging
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.appointments.interfaces.appointment import AppointmentsRepositoryProtocol, AppointmentsServiceProtocol
from src.domain.appointments.services.appointments_use_cases import AppointmentsServiceImpl
from src.infrastructure.database.base import get_async_session
from src.infrastructure.database.repositories.appointmetns_repository import AppointmentsRepositoryImpl

log = logging.getLogger(__name__)

Session = Annotated[AsyncSession, Depends(get_async_session)]

# --- repositories ---

def get_appointments_repository(session: Session) -> AppointmentsRepositoryProtocol:
    return AppointmentsRepositoryImpl(session)


AppointmentsFactoryRepository = Annotated[AppointmentsRepositoryProtocol, Depends(get_appointments_repository)]


# --- services ---

def get_user_service(user_factory_repository: AppointmentsFactoryRepository) -> AppointmentsServiceProtocol:
    return  AppointmentsServiceImpl(user_factory_repository)

AppointmentsService = Annotated[AppointmentsServiceProtocol, Depends(get_user_service)]

