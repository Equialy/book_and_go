from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, TIMESTAMP, func

from src.infrastructure.database.base import Base


class Users(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(length=100), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(length=100),unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(length=1024), nullable=False)
    created: Mapped[datetime] = mapped_column(TIMESTAMP(0), server_default=func.now())
