from src.domain.appointments.interfaces.appointment import AppointmentsRepositoryProtocol
from src.domain.appointments.schemas.appointment import AppointmentsSchemaBase, AppointmentsSchema


class AppointmentsServiceImpl:
    def __init__(self, appointments_factory_repository: AppointmentsRepositoryProtocol) -> None:
        self.appointments_factory_repository = appointments_factory_repository

    # async def get_by_username(self, pagination: PaginationParamsBooks) -> list[AppointmentsSchemaBase]:
    #     pass

    async def create_appointment(self, appointment_model: AppointmentsSchema) -> AppointmentsSchemaBase:
        return await self.appointments_factory_repository.create(appointment=appointment_model)

    async def get_by_email_appointment(self, book_id: int) -> AppointmentsSchemaBase:
        pass

    async def get_all_appointment(self) -> AppointmentsSchemaBase:
        return await self.appointments_factory_repository.get_all()

    async def delete_appointment(self, appointment: int) -> AppointmentsSchemaBase:
        return await self.appointments_factory_repository.delete(appointment)
