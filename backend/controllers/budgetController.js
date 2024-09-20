const Budget = require('../models/budget');

const budgetController = {
    getUserBudget: async (req, res) => {
        try {
            console.log('Obteniendo presupuesto para el usuario:', req.user.userId);
            const budget = await Budget.getBudgetByUserId(req.user.userId);
            const expenses = await Budget.getExpensesByUserId(req.user.userId);
            const extraIncomes = await Budget.getExtraIncomesByUserId(req.user.userId);
            
            res.json({
                budget,
                expenses,
                extraIncomes
            });
        } catch (error) {
            console.error('Error al obtener el presupuesto:', error);
            res.status(500).json({ message: 'Error al obtener el presupuesto' });
        }
    },

    createOrUpdateBudget: async (req, res) => {
        try {
            console.log('Creando/actualizando presupuesto para el usuario:', req.user.userId);
            const { budgetName, initialIncome, start_date, end_date } = req.body;
            const userId = req.user.userId;

            const budget = await Budget.createOrUpdateBudget(userId, {
                budgetName,
                initialIncome,
                start_date,
                end_date
            });

            res.status(201).json(budget);
        } catch (error) {
            console.error('Error al crear/actualizar el presupuesto:', error);
            res.status(500).json({ message: 'Error al crear/actualizar el presupuesto' });
        }
    },

    addExpense: async (req, res) => {
        try {
            const { description, amount, category } = req.body;
            const userId = req.user.userId;
            const result = await Budget.addExpense(userId, description, amount, category);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al agregar el gasto:', error);
            res.status(500).json({ message: 'Error al agregar el gasto' });
        }
    },

    createNewBudget: async (req, res) => {
        try {
            console.log('Creando un nuevo presupuesto para el usuario:', req.user.userId);
            const { budgetName, initialIncome, start_date, end_date } = req.body;
            const userId = req.user.userId;

            const budget = await Budget.createNewBudget(userId, {
                budgetName,
                initialIncome,
                start_date,
                end_date
            });

            res.status(201).json(budget);
        } catch (error) {
            console.error('Error al crear un nuevo presupuesto:', error);
            res.status(500).json({ message: 'Error al crear un nuevo presupuesto' });
        }
    },

    deleteBudget: async (req, res) => {
        try {
            const userId = req.user.userId;
            const result = await Budget.deleteBudget(userId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al eliminar el presupuesto:', error);
            res.status(500).json({ message: 'Error al eliminar el presupuesto' });
        }
    },

    deleteExpense: async (req, res) => {
        try {
            const userId = req.user.userId;
            const expenseId = req.params.id;

            const result = await Budget.deleteExpense(userId, expenseId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al eliminar el gasto:', error);
            res.status(500).json({ message: 'Error al eliminar el gasto' });
        }
    },

    addExtraIncome: async (req, res) => {
        try {
            const extraIncomeData = req.body;
            const userId = req.user.userId;
            const result = await Budget.addExtraIncome(userId, extraIncomeData);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al agregar ingreso extra:', error);
            res.status(500).json({ message: 'Error al agregar ingreso extra' });
        }
    },

    updateExtraIncome: async (req, res) => {
        try {
            const userId = req.user.userId;
            const incomeId = req.params.incomeId;
            const { amount, description } = req.body;

            const result = await Budget.updateExtraIncome(userId, incomeId, { amount, description });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al actualizar el ingreso extra:', error);
            res.status(500).json({ message: 'Error al actualizar el ingreso extra' });
        }
    },

    deleteExtraIncome: async (req, res) => {
        try {
            const userId = req.user.userId;
            const incomeId = req.params.incomeId;

            const result = await Budget.deleteExtraIncome(userId, incomeId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al eliminar el ingreso extra:', error);
            res.status(500).json({ message: 'Error al eliminar el ingreso extra' });
        }
    },

    updateBudgetAmount: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { newAmount } = req.body;

            console.log('Received newAmount:', newAmount, 'Type:', typeof newAmount);

            const numericAmount = Number(newAmount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                console.log('Invalid newAmount:', newAmount);
                return res.status(400).json({ message: 'El monto del presupuesto debe ser un número válido.' });
            }

            console.log(`Actualizando el presupuesto para el usuario: ${userId} con monto: ${numericAmount}`);

            const updatedBudget = await Budget.updateBudgetAmount(userId, numericAmount);
            res.status(200).json(updatedBudget);
        } catch (error) {
            console.error('Error al actualizar el monto del presupuesto:', error);
            res.status(500).json({ message: 'Error al actualizar el monto del presupuesto' });
        }
    }
};

module.exports = budgetController;




