from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.appointments.schemas.appointment import AppointmentsSchemaBase, AppointmentsSchema
from src.infrastructure.database.models.appointments import Appointments
import sqlalchemy as sa


class AppointmentsRepositoryImpl:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.model = Appointments

    async def get_by_username(self, username: str) -> AppointmentsSchemaBase | None: ...

    async def create(self, appointment: AppointmentsSchema) -> AppointmentsSchemaBase:
        stmt = sa.insert(self.model).values(appointment.model_dump()).returning(self.model)
        model = await self.session.execute(stmt)
        result = model.scalar_one()
        return AppointmentsSchemaBase.model_validate(result)

    async def get_by_email(self, email: str) -> AppointmentsSchemaBase | None: ...

    async def get_all(self) -> list[AppointmentsSchemaBase] | None:
        stmt = sa.select(self.model)
        result = await self.session.execute(stmt)
        appointments = result.scalars().all()
        return [AppointmentsSchemaBase.model_validate(obj) for obj in appointments ]

    async def delete(self,  appointment: int) -> AppointmentsSchemaBase:
        stmt = sa.delete(self.model).where(self.model.id== appointment).returning(self.model)
        model = await self.session.execute(stmt)
        result = model.scalar_one()
        return AppointmentsSchemaBase.model_validate(result)
