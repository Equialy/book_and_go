import bcrypt


class PasswordManagerImpl:
    """Хранит и проверяет хэши паролей."""
    def hash_password(
            self,
            password: str,
    ) -> str:
        salt = bcrypt.gensalt()
        pwd_bytes: bytes = password.encode()
        return bcrypt.hashpw(pwd_bytes, salt).decode()

    def validate_password(
            self,
            password: str,
            hashed_password: str,
    ) -> bool:
        return bcrypt.checkpw(
            password=password.encode(),
            hashed_password=hashed_password.encode(),
        )
