const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname)));

// Маршрутизация для основных страниц
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'booking.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'success.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).send('Страница не найдена');
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`); # 0.0.0.0 для прода
});