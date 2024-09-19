const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
require('dotenv').config();

const authController = {
    register: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const existingUser = await User.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'El usuario ya está registrado.' });
            }

            const newUser = await User.createUser(email, password);

            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            console.log('Token generado para el nuevo usuario:', newUser.email);
            console.log('Token:', token);

            res.status(201).json({ token, user: { id: newUser.id, email: newUser.email } });
        } catch (error) {
            console.error('Error en el registro:', error);
            res.status(500).json({ message: 'Error al registrar el usuario.' });
        }
    },

    login: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await User.findUserByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Credenciales inválidas.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Credenciales inválidas.' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            console.log('Token generado para:', user.email);
            console.log('Token:', token);

            res.status(200).json({ token, user: { id: user.id, email: user.email } });
        } catch (error) {
            console.error('Error en el login:', error);
            res.status(500).json({ message: 'Error al iniciar sesión.' });
        }
    },
};

module.exports = authController;