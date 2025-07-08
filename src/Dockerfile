FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
# Установка зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Запуск приложения
CMD ["uvicorn", "src.presentation.main:app", "--host", "0.0.0.0", "--port", "8000"]
# для прода указывается "0.0.0.0"