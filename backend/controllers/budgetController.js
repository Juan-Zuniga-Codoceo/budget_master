// controllers/budgetController.js

const Budget = require('../models/budget');

const budgetController = {
    getUserBudget: async (req, res) => {
        try {
            console.log('Obteniendo presupuesto para el usuario:', req.user.userId);
            // Llamada al método correcto
            const budget = await Budget.getBudgetByUserId(req.user.userId);
            res.json(budget);
        } catch (error) {
            console.error('Error detallado al obtener el presupuesto:', error);
            res.status(500).json({ message: 'Error al obtener el presupuesto', error: error.message });
        }
    },

    createOrUpdateBudget: async (req, res) => {
        try {
            console.log('Creando/actualizando presupuesto para el usuario:', req.user.userId);
            console.log('Datos recibidos:', req.body);
            const { budgetName, initialIncome, startDate, endDate } = req.body;
            const userId = req.user.userId;

            const budget = await Budget.createOrUpdateBudget(userId, {
                budgetName,
                initialIncome,
                startDate,
                endDate
            });

            res.status(201).json(budget);
        } catch (error) {
            console.error('Error detallado al crear/actualizar el presupuesto:', error);
            res.status(500).json({ message: 'Error al crear/actualizar el presupuesto', error: error.message });
        }
    },
};

module.exports = budgetController;
