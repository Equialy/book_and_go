from pydantic import BaseModel, ConfigDict, Field, AliasGenerator
from pydantic.alias_generators import to_camel


class UsersSchema(BaseModel):
    id: int = Field(..., ge=1)
    username: str = Field(..., max_length=255)
    email: str
    password: str = Field(..., min_length=4, max_length=255)

    model_config = ConfigDict(from_attributes=True, alias_generator=AliasGenerator(serialization_alias=to_camel))


class UsersSchemaAdd(BaseModel):
    username: str = Field(..., min_length=1, max_length=255)
    email: str
    password: str = Field(..., min_length=4, max_length=255)

    model_config = ConfigDict(from_attributes=True, alias_generator=AliasGenerator(serialization_alias=to_camel))


class TokenJWT(BaseModel):
    access_token: str
    token_type: str


class UsersSchemaAuth(BaseModel):
    username: str = Field(..., max_length=255)
    email: str
    password: str = Field(..., min_length=4, max_length=255)

    model_config = ConfigDict(from_attributes=True, strict=True,
                              alias_generator=AliasGenerator(serialization_alias=to_camel))
