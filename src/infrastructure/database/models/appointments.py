from src.infrastructure.database.base import Base
from datetime import datetime, date

from sqlalchemy import  func,  TIMESTAMP, String,  Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column

class Appointments(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(length=100), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(length=100),unique=False, nullable=False)
    phone: Mapped[str] = mapped_column(String(length=100),unique=False, nullable=False)
    service: Mapped[str] = mapped_column(String(length=100),unique=False, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=False)
    time: Mapped[str] = mapped_column(String(length=15))
    notes: Mapped[str] = mapped_column(String(length=100),unique=False, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

