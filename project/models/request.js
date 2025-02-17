const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Request = sequelize.define('requests', {
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('new', 'in_progress', 'completed', 'canceled'),
            defaultValue: 'new'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            onUpdate: 'CURRENT_TIMESTAMP'
        }
    });

    return Request;
};