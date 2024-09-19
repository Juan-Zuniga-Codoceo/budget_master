const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBudget } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', budgetController.getUserBudget);
router.post('/create-update', validateBudget, budgetController.createOrUpdateBudget);

module.exports = router;
