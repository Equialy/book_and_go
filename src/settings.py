from pathlib import Path
from typing import Annotated

from fastapi import Depends
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

BASE_DIR = Path(__file__).resolve().parent.parent


class Db(BaseModel):
    """
    Настройки для подключения к базе данных.
    """

    host: str
    port: int
    user: str
    password: str
    name: str
    scheme: str = 'public'

    provider: str = 'postgresql+asyncpg'

    @property
    def url_db(self) -> str:
        return f'{self.provider}://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}'


class ApiV1Prefix(BaseModel):
    prefix: str = "/api/v1"
    panel: str = "/panel"
    jwt: str = "/jwt"
    auth: str = "/auth"
    users: str = "/users"


class ApiPrefix(BaseModel):
    prefix: str = "/api"
    v1: ApiV1Prefix = ApiV1Prefix()

    @property
    def bearer_token_url(self) -> str:
        parts = (self.prefix, self.v1.prefix, self.v1.auth, "/login")
        path = "".join(parts)
        return path.removeprefix("/")


class JWT(BaseModel):
    """
    Настройки JWT токена.
    """

    secret_key: str
    algorithm: str
    schema_crypt_context: str
    expire_minutes: int

class TestDb(BaseModel):
    """
    Настройки для подключения к тестовой базе данных.
    """

    test_host: str
    test_port: int
    test_user: str
    test_password: str
    test_name: str
    scheme: str = 'public'

    test_provider: str = 'postgresql+asyncpg'

    @property
    def url_db_test(self) -> str:
        return f'{self.test_provider}://{self.test_user}:{self.test_password}@{self.test_host}:{self.test_port}/{self.test_name}'



class Settings(BaseSettings):
    """
    Настройки модели.
    """
    base_url: str
    api: ApiPrefix = ApiPrefix()

    cors_origins: list[str]
    test: int
    test_db: TestDb


    db: Db

    jwt: JWT

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding='utf-8',
        env_nested_delimiter='__',
        case_sensitive=False,
        extra='ignore',
    )


def get_settings():
    return Settings()


def config_logging(level=logging.INFO):
    logging.basicConfig(
        level=level,
        datefmt="%Y-%m-%d %H:%M:%S",
        format="[%(asctime)s.%(msecs)03d] %(module)7s:%(lineno)-3d %(levelname)-7s - %(message)s",
        handlers=[
            logging.FileHandler(BASE_DIR / "logs/logs.log"),
            logging.StreamHandler()
        ]

    )


settings = get_settings()

SettingsService = Annotated[Settings, Depends(get_settings)]
