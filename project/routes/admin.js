const express = require('express');
const router = express.Router();
const { Request, User } = require('../models');

router.get('/all-requests', async (req, res) => {
    try {
        const requests = await Request.findAll({
            include: [User],
            order: [['createdAt', 'DESC']]
        });
        return res.json(requests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Произошла ошибка при получении заявок' });
    }
});

router.put('/update-request/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        const request = await Request.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        await request.update({ status, comment });
        return res.json(request);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Произошла ошибка при обновлении заявки' });
    }
});

module.exports = router;