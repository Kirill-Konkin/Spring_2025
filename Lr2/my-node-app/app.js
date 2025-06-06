const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Настройка Middlewares
app.use(cors());
app.use(bodyParser.json());

// Статическая папка
app.use(express.static(path.join(__dirname, 'public')));

// Путь к файлу с данными
const DATA_FILE = path.join(__dirname, 'data.json');

// Функция для чтения данных из файла
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return []; // Возвращаем пустой массив, если файл не существует
    }
    const fileContent = fs.readFileSync(DATA_FILE);
    return JSON.parse(fileContent);
};

// Функция для записи данных в файл
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('Записано в файл:', JSON.stringify(data, null, 2)); // Отладка
};

// Получение данных
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

// Добавление новых данных
app.post('/api/data', (req, res) => {
    const newData = req.body;
    const data = readData();
    data.push(newData); // Добавление нового объекта
    writeData(data);
    res.status(201).json(newData);
});

// Обновление данных
app.put('/api/data/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);  // Преобразуем параметр к целому числу
    const updatedEmployee = req.body;
    const data = readData();

    // Проверка, существует ли запись
    if (index < 0 || index >= data.length) {
        console.error(`Сотрудник не найден по индексу: ${index}`);
        return res.status(404).send('Сотрудник не найден');
    }

    console.log(`Обновление сотрудника по индексу ${index}:`, updatedEmployee);
    data[index] = updatedEmployee; // Обновление записи
    writeData(data);
    res.status(200).json(updatedEmployee);
});

// Удаление данных
app.delete('/api/data/:index', (req, res) => {
    const index = parseInt(req.params.index, 10); // Преобразуем параметр к целому числу
    const data = readData();
    
    // Проверка, существует ли запись
    if (index < 0 || index >= data.length) {
        console.error(`Сотрудник не найден по индексу: ${index}`);
        return res.status(404).send('Сотрудник не найден');
    }
    
    data.splice(index, 1); // Удаление записи
    writeData(data);
    res.status(204).send();  // Ответ без контента
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});