const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (username) user.username = username;
        
        // Aquí puedes manejar la actualización de la foto de perfil si lo implementas

        await user.save();

        res.json(user);
    } catch (error) {
        console.error('Error al actualizar el perfil del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar el perfil' });
    }
};