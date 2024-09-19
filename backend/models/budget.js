const pool = require('../config/db');

class Budget {
    static async createOrUpdateBudget(userId, budgetData) {
        const { budgetName, initialIncome, start_date, end_date } = budgetData;
        try {
            const result = await pool.query(
                `INSERT INTO budgets (user_id, budget_name, initial_income, total_income, start_date, end_date)
                 VALUES ($1, $2, $3, $3, $4, $5)
                 ON CONFLICT (user_id)
                 DO UPDATE SET
                    budget_name = $2,
                    initial_income = $3,
                    total_income = budgets.total_income - budgets.initial_income + $3,
                    start_date = $4,
                    end_date = $5
                 RETURNING *`,
                [userId, budgetName, initialIncome, start_date, end_date]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
    

    static async addExtraIncome(userId, extraIncome) {
        try {
            const result = await pool.query(
                `UPDATE budgets
                 SET extra_income = COALESCE(extra_income, 0) + \$1,
                     total_income = total_income + \$1
                 WHERE user_id = \$2
                 RETURNING *`,
                [extraIncome, userId]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async addExpense(userId, description, amount, category) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const expenseResult = await client.query(
                `INSERT INTO expenses (user_id, description, amount, category)
                 VALUES (\$1, \$2, \$3, \$4)
                 RETURNING *`,
                [userId, description, amount, category]
            );
            const budgetResult = await client.query(
                `UPDATE budgets
                 SET total_expenses = COALESCE(total_expenses, 0) + \$1,
                     balance = total_income - (COALESCE(total_expenses, 0) + \$1)
                 WHERE user_id = \$2
                 RETURNING *`,
                [amount, userId]
            );
            await client.query('COMMIT');
            return {
                expense: expenseResult.rows[0],
                updatedBudget: budgetResult.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getBudgetByUserId(userId) {
        try {
            const result = await pool.query(
                'SELECT * FROM budgets WHERE user_id = \$1',
                [userId]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getExpensesByUserId(userId) {
        try {
            const result = await pool.query(
                'SELECT * FROM expenses WHERE user_id = \$1 ORDER BY created_at DESC',
                [userId]
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async deleteExpense(expenseId, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const expenseResult = await client.query(
                'DELETE FROM expenses WHERE id = \$1 AND user_id = \$2 RETURNING amount',
                [expenseId, userId]
            );
            if (expenseResult.rows.length === 0) {
                throw new Error('Gasto no encontrado o no autorizado');
            }
            const { amount } = expenseResult.rows[0];
            const budgetResult = await client.query(
                `UPDATE budgets
                 SET total_expenses = total_expenses - \$1,
                     balance = balance + \$1
                 WHERE user_id = \$2
                 RETURNING *`,
                [amount, userId]
            );
            await client.query('COMMIT');
            return {
                deletedExpense: expenseResult.rows[0],
                updatedBudget: budgetResult.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = Budget;