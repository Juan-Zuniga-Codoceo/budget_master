const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar el middleware de autenticación a todas las rutas de usuario
router.use(authMiddleware);

// Ruta para obtener el perfil del usuario
router.get('/profile', userController.getUserProfile);

// Ruta para actualizar el perfil del usuario
router.put('/profile', userController.updateProfile);

module.exports = router;