const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async createUser(email, password, username = null) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await pool.query(
                'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username',
                [email.toLowerCase(), hashedPassword, username]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findUserByEmail(email) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
                [email]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findUserById(userId) {
        try {
            const result = await pool.query(
                'SELECT id, email, username FROM users WHERE id = $1',
                [userId]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async updateProfile(userId, userData) {
        try {
            const { username } = userData;
            const result = await pool.query(
                'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, email, username',
                [username, userId]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async changePassword(userId, newPassword) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await pool.query(
                'UPDATE users SET password = $1 WHERE id = $2',
                [hashedPassword, userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;