// middleware/validators.js

const { body } = require('express-validator');

const validateRegister = [
    body('email').isEmail().withMessage('Ingrese un email válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

const validateLogin = [
    body('email').isEmail().withMessage('Ingrese un email válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
];

const validateBudget = [
    body('initialIncome').isNumeric().withMessage('El ingreso inicial debe ser un número'),
    body('budgetName').notEmpty().withMessage('El nombre del presupuesto es requerido'),
    body('startDate').isDate().withMessage('La fecha de inicio debe ser una fecha válida'),
    body('endDate').isDate().withMessage('La fecha de fin debe ser una fecha válida')
];

module.exports = {
    validateRegister,
    validateLogin,
    validateBudget
};