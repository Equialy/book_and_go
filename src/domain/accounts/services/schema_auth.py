from fastapi.security import OAuth2PasswordBearer

from src.settings import settings

oauth2_schema = OAuth2PasswordBearer(tokenUrl=settings.api.v1.prefix + "/login")
