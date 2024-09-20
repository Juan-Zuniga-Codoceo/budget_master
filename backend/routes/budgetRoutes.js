const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar el middleware de autenticación
router.use(authMiddleware);

// Rutas para obtener y gestionar el presupuesto
router.get('/', budgetController.getUserBudget);
router.post('/create-update', budgetController.createOrUpdateBudget);
router.post('/add-expense', budgetController.addExpense);
router.post('/add-extra-income', budgetController.addExtraIncome);

// Rutas para actualizar y eliminar ingresos extra
router.put('/extra-income/:incomeId', budgetController.updateExtraIncome);
router.delete('/extra-income/:incomeId', budgetController.deleteExtraIncome);

router.put('/update-amount', budgetController.updateBudgetAmount);
router.delete('/delete-budget', budgetController.deleteBudget);

module.exports = router;
