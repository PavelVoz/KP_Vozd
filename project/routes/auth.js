const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Не все поля заполнены' });
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }

        const user = await User.create({ username, password });
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Произошла ошибка при регистрации' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Не все поля заполнены' });
        }

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        const isValid = await user.isValidPassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Произошла ошибка при входе' });
    }
});

module.exports = router;