const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async createUser(email, password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await pool.query(
                'INSERT INTO users (email, password) VALUES (\$1, \$2) RETURNING id, email',
                [email.toLowerCase(), hashedPassword]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findUserByEmail(email) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE LOWER(email) = LOWER(\$1)',
                [email]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;