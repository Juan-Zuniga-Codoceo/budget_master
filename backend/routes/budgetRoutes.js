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
router.put('/update-expense/:expenseId', budgetController.updateExpense);
router.delete('/delete-expense/:expenseId', budgetController.deleteExpense);
router.post('/add-extra-income', budgetController.addExtraIncome);

// Rutas para actualizar y eliminar ingresos extra
router.put('/extra-income/:incomeId', budgetController.updateExtraIncome);
router.delete('/extra-income/:incomeId', budgetController.deleteExtraIncome);

router.put('/update-amount', budgetController.updateBudgetAmount);
router.delete('/delete-budget', budgetController.deleteBudget);

// Nuevas rutas para guardar y descargar presupuestos
router.post('/save', budgetController.saveBudget);
router.get('/download-excel', budgetController.downloadBudgetExcel);

module.exports = router;