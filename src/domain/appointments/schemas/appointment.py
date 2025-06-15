from pydantic import BaseModel, ConfigDict, Field, AliasGenerator
from pydantic.alias_generators import to_camel
from datetime import date, datetime


class AppointmentsSchema(BaseModel):

    name: str = Field(..., max_length=255, min_length=3)
    email: str = Field(..., max_length=255, min_length=3)
    phone: str = Field(max_length=11, min_length=3)
    service: str = Field(max_length=255, min_length=3)
    date: date
    time: str
    notes: str | None = Field(max_length=255, default=None)
    createdAt: datetime




    model_config = ConfigDict(from_attributes=True, alias_generator=AliasGenerator(serialization_alias=to_camel))


class AppointmentsSchemaBase(AppointmentsSchema):
    id: int = Field(..., ge=1)

    model_config = ConfigDict(from_attributes=True, alias_generator=AliasGenerator(serialization_alias=to_camel))

