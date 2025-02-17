const express = require('express');
const router = express.Router();
const { Request, User } = require('../models');

router.post('/', async (req, res) => {
    try {
        const { description, equipmentType } = req.body;
        if (!description || !equipmentType) {
            return res.status(400).json({ message: 'Не все поля заполнены' });
        }

        const userId = req.user.id; // ID пользователя из токена
        const request = await Request.create({
            description,
            equipmentType,
            userId
        });

        return res.status(201).json(request);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Произошла ошибка при создании заявки' });
    }
});

router.get('/', async (req, res) => {
    try {
        const userId = req.user.id; // ID пользователя из токена
        const requests = await Request.findAll({
            where: { userId },
            include: [User],
            order: [['createdAt', 'DESC']]
        });
        return res.json(requests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Произошла ошибка при получении заявок' });
    }
});

module.exports = router;