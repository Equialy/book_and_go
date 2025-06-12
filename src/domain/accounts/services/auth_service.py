from datetime import timedelta

from fastapi import HTTPException, status, Form
from jose import JWTError
from src.domain.accounts.interfaces.auth import PasswordManagerProtocol, JWTServiceProtocol
from src.domain.accounts.interfaces.user import UserRepositoryProtocol
from src.domain.accounts.schemas.user import UsersSchemaAuth


class AuthServiceImpl:
    """
       Сервис аутентификации и управления JWT‑токенами.

       Методы:
         * encode_jwt(payload, expire_timedelta): Кодирует переданный payload в JWT. Опционально задаёт время жизни токена.
         * decode_jwt(token): Декодирует JWT и возвращает его содержимое (payload). При любом сбое
             валидации или истечении срока жизни выдаёт HTTPException 401.
         * validate_auth_user(username, password): Принимает данные формы (username и password), проверяет существование пользователя
             и корректность пароля.
       """
    def __init__(
            self,
            user_repo: UserRepositoryProtocol,
            pwd_manager: PasswordManagerProtocol,
            jwt_manager: JWTServiceProtocol
    ):
        self.user_repo = user_repo
        self.password_service = pwd_manager
        self.jwt_service = jwt_manager

    def encode_jwt(self, payload: dict, expire_timedelta: timedelta | None = None) -> str:
        return self.jwt_service.encode_jwt(payload=payload,expire_timedelta=expire_timedelta)

    def decode_jwt(self, token: str) -> dict:
        try:
            return self.jwt_service.decode_jwt(token=token)
        except JWTError as e:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def validate_auth_user(self, email: str = Form(), password: str = Form()) -> UsersSchemaAuth:
        """Проверка username и пароля при отправке через форму"""
        user = await self.user_repo.get_by_email(email=email)
        if not user or not self.password_service.validate_password(password, user.password):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="invalid username or password")
        return user
