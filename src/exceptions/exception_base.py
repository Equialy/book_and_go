class BorrowLimitExceededError(Exception):
    """
    Выбрасывается, когда читатель пытается взять больше допустимого
    количества книг.
    """
    def __init__(self, reader_id: int, limit: int = 3):
        super().__init__(f"Читатель с id: {reader_id} уже взял {limit} книг — больше нельзя")
        self.reader_id = reader_id
        self.limit = limit


class NotFoundError(Exception):
    def __init__(self, id: int, msg: str | None = None) -> None:
        self.id = id
        self.msg = msg

class QuantityError(Exception):
    def __init__(self, id: int, msg: str | None = None) -> None:
        self.id = id
        self.msg = "Недостаточно книг"
