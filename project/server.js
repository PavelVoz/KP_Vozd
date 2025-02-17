const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./middlewares/auth');

// Настройки CORS
app.use(cors());

// Парсинг тела запроса
app.use(bodyParser.json());

// Подключение статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к базе данных
const sequelize = require('./config/db.config');

// Определение моделей
const User = require('./models/user')(sequelize);
const Request = require('./models/request')(sequelize);

User.hasMany(Request);
Request.belongsTo(User);

// Инициализация базы данных
sequelize.sync({ force: false }).then(() => {
    console.log("База данных синхронизирована");
}).catch((err) => {
    console.error("Ошибка при синхронизации базы данных:", err);
});

// Маршруты API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', authMiddleware, require('./routes/requests'));
app.use('/api/admin', authMiddleware, require('./routes/admin'));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});