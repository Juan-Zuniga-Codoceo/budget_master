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

    static async createNewBudget(userId, budgetData) {
        const { budgetName, initialIncome, start_date, end_date } = budgetData;
        try {
            const result = await pool.query(
                `INSERT INTO budgets (user_id, budget_name, initial_income, total_income, start_date, end_date)
                 VALUES ($1, $2, $3, $3, $4, $5)
                 RETURNING *`,
                [userId, budgetName, initialIncome, start_date, end_date]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deleteBudget(userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Eliminar ingresos extras relacionados con el presupuesto
            await client.query(`DELETE FROM extra_incomes WHERE user_id = $1`, [userId]);

            // Eliminar presupuesto
            const result = await client.query(
                `DELETE FROM budgets WHERE user_id = $1 RETURNING *`,
                [userId]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateBudgetAmount(userId, newAmount) {
        try {
            const result = await pool.query(
                `UPDATE budgets
                 SET initial_income = $1,
                     total_income = COALESCE(total_income, 0) - COALESCE(initial_income, 0) + $1::numeric,
                     balance = COALESCE(total_income, 0) - COALESCE(initial_income, 0) + $1::numeric - COALESCE(total_expenses, 0)
                 WHERE user_id = $2
                 RETURNING *`,
                [newAmount, userId]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async addExtraIncome(userId, extraIncomeData) {
        const { amount, description, date } = extraIncomeData;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insertar el ingreso extra
            const extraIncomeResult = await client.query(
                `INSERT INTO extra_incomes (user_id, amount, description, date)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [userId, amount, description, date]
            );

            // Actualizar el presupuesto con el ingreso extra
            const budgetUpdateResult = await client.query(
                `UPDATE budgets
                 SET extra_income = COALESCE(extra_income, 0) + $1,
                     total_income = total_income + $1
                 WHERE user_id = $2
                 RETURNING *`,
                [amount, userId]
            );

            await client.query('COMMIT');
            return {
                extraIncome: extraIncomeResult.rows[0],
                updatedBudget: budgetUpdateResult.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateExtraIncome(userId, incomeId, extraIncomeData) {
        const { amount, description } = extraIncomeData;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Actualizar el ingreso extra
            const extraIncomeResult = await client.query(
                `UPDATE extra_incomes
                 SET amount = $1, description = $2
                 WHERE id = $3 AND user_id = $4
                 RETURNING *`,
                [amount, description, incomeId, userId]
            );

            // Actualizar el presupuesto con el nuevo monto del ingreso extra
            const budgetUpdateResult = await client.query(
                `UPDATE budgets
                 SET total_income = total_income + ($1 - (SELECT amount FROM extra_incomes WHERE id = $2))
                 WHERE user_id = $3
                 RETURNING *`,
                [amount, incomeId, userId]
            );

            await client.query('COMMIT');
            return {
                updatedIncome: extraIncomeResult.rows[0],
                updatedBudget: budgetUpdateResult.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async deleteExtraIncome(userId, incomeId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Eliminar el ingreso extra
            const extraIncomeResult = await client.query(
                `DELETE FROM extra_incomes WHERE id = $1 AND user_id = $2 RETURNING amount`,
                [incomeId, userId]
            );

            if (extraIncomeResult.rows.length === 0) {
                throw new Error('Ingreso extra no encontrado o no autorizado');
            }

            const { amount } = extraIncomeResult.rows[0];

            // Actualizar el presupuesto restando el ingreso extra eliminado
            const budgetUpdateResult = await client.query(
                `UPDATE budgets
                 SET total_income = total_income - $1
                 WHERE user_id = $2
                 RETURNING *`,
                [amount, userId]
            );

            await client.query('COMMIT');
            return {
                deletedIncome: extraIncomeResult.rows[0],
                updatedBudget: budgetUpdateResult.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async addExpense(userId, description, amount, category) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const expenseResult = await client.query(
                `INSERT INTO expenses (user_id, description, amount, category)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [userId, description, amount, category]
            );
            const budgetResult = await client.query(
                `UPDATE budgets
                 SET total_expenses = COALESCE(total_expenses, 0) + $1,
                     balance = total_income - (COALESCE(total_expenses, 0) + $1)
                 WHERE user_id = $2
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

    static async deleteExpense(userId, expenseId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Eliminar el gasto
            const expenseResult = await client.query(
                `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING amount`,
                [expenseId, userId]
            );

            if (expenseResult.rows.length === 0) {
                throw new Error('Gasto no encontrado o no autorizado');
            }

            const { amount } = expenseResult.rows[0];

            // Actualizar el presupuesto restando el gasto eliminado
            const budgetResult = await client.query(
                `UPDATE budgets
                 SET total_expenses = total_expenses - $1,
                     balance = balance + $1
                 WHERE user_id = $2
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

    static async getBudgetByUserId(userId) {
        try {
            const result = await pool.query(
                'SELECT * FROM budgets WHERE user_id = $1',
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
                'SELECT * FROM expenses WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getExtraIncomesByUserId(userId) {
        try {
            const result = await pool.query(
                'SELECT * FROM extra_incomes WHERE user_id = $1 ORDER BY date DESC',
                [userId]
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
    static async updateExpense(userId, expenseId, expenseData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Actualizar el gasto
            const expenseResult = await client.query(
                `UPDATE expenses SET amount = $1, description = $2, category = $3
                 WHERE id = $4 AND user_id = $5 RETURNING *`,
                [expenseData.amount, expenseData.description, expenseData.category, expenseId, userId]
            );

            // Actualizar el presupuesto
            const budgetResult = await client.query(
                `UPDATE budgets
                 SET total_expenses = (SELECT SUM(amount) FROM expenses WHERE user_id = $1),
                     balance = total_income - (SELECT SUM(amount) FROM expenses WHERE user_id = $1)
                 WHERE user_id = $1 RETURNING *`,
                [userId]
            );

            await client.query('COMMIT');
            return {
                updatedExpense: expenseResult.rows[0],
                updatedBudget: budgetResult.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async deleteExpense(userId, expenseId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Eliminar el gasto
            const expenseResult = await client.query(
                `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *`,
                [expenseId, userId]
            );

            // Actualizar el presupuesto
            const budgetResult = await client.query(
                `UPDATE budgets
                 SET total_expenses = (SELECT SUM(amount) FROM expenses WHERE user_id = $1),
                     balance = total_income - (SELECT SUM(amount) FROM expenses WHERE user_id = $1)
                 WHERE user_id = $1 RETURNING *`,
                [userId]
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

    static async saveBudget(userId, budgetData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Insertar en la tabla saved_budgets
            const result = await client.query(
                `INSERT INTO saved_budgets (user_id, budget_data, created_at)
                 VALUES ($1, $2, NOW()) RETURNING *`,
                [userId, JSON.stringify(budgetData)]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async generateExcel(userId) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Presupuesto');

        try {
            // Obtener datos del presupuesto, gastos e ingresos extras
            const budgetData = await this.getBudgetByUserId(userId);
            const expenses = await this.getExpensesByUserId(userId);
            const extraIncomes = await this.getExtraIncomesByUserId(userId);

            // Añadir datos al worksheet
            worksheet.addRow(['Presupuesto']);
            worksheet.addRow(['Ingresos Totales', budgetData.total_income]);
            worksheet.addRow(['Gastos Totales', budgetData.total_expenses]);
            worksheet.addRow(['Balance', budgetData.balance]);

            worksheet.addRow([]);
            worksheet.addRow(['Gastos']);
            worksheet.addRow(['Descripción', 'Monto', 'Categoría']);
            expenses.forEach(expense => {
                worksheet.addRow([expense.description, expense.amount, expense.category]);
            });

            worksheet.addRow([]);
            worksheet.addRow(['Ingresos Extras']);
            worksheet.addRow(['Descripción', 'Monto']);
            extraIncomes.forEach(income => {
                worksheet.addRow([income.description, income.amount]);
            });

            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            console.error('Error generando el archivo Excel:', error);
            throw error;
        }
    }

}

module.exports = Budget;
