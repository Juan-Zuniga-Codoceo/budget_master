const Budget = require("../models/budget");

const budgetController = {
  getUserBudget: async (req, res) => {
    try {
      console.log("Obteniendo presupuesto para el usuario:", req.user.userId);
      const budget = await Budget.getBudgetByUserId(req.user.userId);
      const expenses = await Budget.getExpensesByUserId(req.user.userId);
      const extraIncomes = await Budget.getExtraIncomesByUserId(
        req.user.userId
      );

      // Asegúrate de que los valores numéricos sean números
      if (budget) {
        budget.initial_income = parseFloat(budget.initial_income);
        budget.total_income = parseFloat(budget.total_income);
        budget.total_expenses = parseFloat(budget.total_expenses);
        budget.balance = parseFloat(budget.balance);
      }

      res.json({
        budget,
        expenses,
        extraIncomes,
      });
    } catch (error) {
      console.error("Error al obtener el presupuesto:", error);
      res.status(500).json({ message: "Error al obtener el presupuesto" });
    }
  },

  createOrUpdateBudget: async (req, res) => {
    try {
      console.log(
        "Creando/actualizando presupuesto para el usuario:",
        req.user.userId
      );
      const { budgetName, initialIncome, start_date, end_date } = req.body;
      const userId = req.user.userId;

      const budget = await Budget.createOrUpdateBudget(userId, {
        budgetName,
        initialIncome,
        start_date,
        end_date,
      });

      res.status(201).json(budget);
    } catch (error) {
      console.error("Error al crear/actualizar el presupuesto:", error);
      res
        .status(500)
        .json({ message: "Error al crear/actualizar el presupuesto" });
    }
  },

  addExpense: async (req, res) => {
    try {
      const { description, amount, category } = req.body;
      const userId = req.user.userId;
      const result = await Budget.addExpense(
        userId,
        description,
        amount,
        category
      );
      res.status(200).json({
        expense: result.expense,
        updatedBudget: result.updatedBudget,
      });
    } catch (error) {
      console.error("Error al agregar el gasto:", error);
      res.status(500).json({ message: "Error al agregar el gasto" });
    }
  },

  createNewBudget: async (req, res) => {
    try {
      console.log(
        "Creando un nuevo presupuesto para el usuario:",
        req.user.userId
      );
      const { budgetName, initialIncome, start_date, end_date } = req.body;
      const userId = req.user.userId;

      const budget = await Budget.createNewBudget(userId, {
        budgetName,
        initialIncome,
        start_date,
        end_date,
      });

      res.status(201).json(budget);
    } catch (error) {
      console.error("Error al crear un nuevo presupuesto:", error);
      res.status(500).json({ message: "Error al crear un nuevo presupuesto" });
    }
  },

  deleteBudget: async (req, res) => {
    try {
      const userId = req.user.userId;
      const result = await Budget.deleteBudget(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error al eliminar el presupuesto:", error);
      res.status(500).json({ message: "Error al eliminar el presupuesto" });
    }
  },

  deleteExpense: async (req, res) => {
    try {
      const userId = req.user.userId;
      const expenseId = req.params.id;

      const result = await Budget.deleteExpense(userId, expenseId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
      res.status(500).json({ message: "Error al eliminar el gasto" });
    }
  },

  addExtraIncome: async (req, res) => {
    try {
      const extraIncomeData = req.body;
      const userId = req.user.userId;
      const result = await Budget.addExtraIncome(userId, extraIncomeData);

      // Obtén el presupuesto actualizado
      const updatedBudget = await Budget.getBudgetByUserId(userId);

      res.status(200).json({
        extraIncome: result.extraIncome,
        updatedBudget,
      });
    } catch (error) {
      console.error("Error al agregar ingreso extra:", error);
      res.status(500).json({ message: "Error al agregar ingreso extra" });
    }
  },

  updateExtraIncome: async (req, res) => {
    try {
      const userId = req.user.userId;
      const incomeId = req.params.incomeId;
      const { amount, description } = req.body;
      const result = await Budget.updateExtraIncome(userId, incomeId, {
        amount,
        description,
      });
      res.status(200).json({
        updatedIncome: result.updatedIncome,
        updatedBudget: result.updatedBudget,
      });
    } catch (error) {
      console.error("Error al actualizar el ingreso extra:", error);
      res.status(500).json({ message: "Error al actualizar el ingreso extra" });
    }
  },

  deleteExtraIncome: async (req, res) => {
    try {
      const userId = req.user.userId;
      const incomeId = req.params.incomeId;
      const result = await Budget.deleteExtraIncome(userId, incomeId);
      res.status(200).json({
        deletedIncome: result.deletedIncome,
        updatedBudget: result.updatedBudget,
      });
    } catch (error) {
      console.error("Error al eliminar el ingreso extra:", error);
      res.status(500).json({ message: "Error al eliminar el ingreso extra" });
    }
  },

  updateBudgetAmount: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { newAmount } = req.body;

      console.log("Received newAmount:", newAmount, "Type:", typeof newAmount);

      const numericAmount = Number(newAmount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        console.log("Invalid newAmount:", newAmount);
        return res
          .status(400)
          .json({
            message: "El monto del presupuesto debe ser un número válido.",
          });
      }

      console.log(
        `Actualizando el presupuesto para el usuario: ${userId} con monto: ${numericAmount}`
      );

      const updatedBudget = await Budget.updateBudgetAmount(
        userId,
        numericAmount
      );
      res.status(200).json(updatedBudget);
    } catch (error) {
      console.error("Error al actualizar el monto del presupuesto:", error);
      res
        .status(500)
        .json({ message: "Error al actualizar el monto del presupuesto" });
    }
  },
  // Añadir estas nuevas funciones al objeto budgetController

  updateExpense: async (req, res) => {
    try {
      const userId = req.user.userId;
      const expenseId = req.params.expenseId;
      const { amount, description, category } = req.body;
      const result = await Budget.updateExpense(userId, expenseId, {
        amount,
        description,
        category,
      });
      res.status(200).json({
        updatedExpense: result.updatedExpense,
        updatedBudget: result.updatedBudget,
      });
    } catch (error) {
      console.error("Error al actualizar el gasto:", error);
      res.status(500).json({ message: "Error al actualizar el gasto" });
    }
  },

  deleteExpense: async (req, res) => {
    try {
      const userId = req.user.userId;
      const expenseId = req.params.expenseId;
      const result = await Budget.deleteExpense(userId, expenseId);
      res.status(200).json({
        deletedExpense: result.deletedExpense,
        updatedBudget: result.updatedBudget,
      });
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
      res.status(500).json({ message: "Error al eliminar el gasto" });
    }
  },

  saveBudget: async (req, res) => {
    try {
      const userId = req.user.userId;
      const budgetData = req.body;
      const result = await Budget.saveBudget(userId, budgetData);
      res
        .status(200)
        .json({
          message: "Presupuesto guardado exitosamente",
          savedBudget: result,
        });
    } catch (error) {
      console.error("Error al guardar el presupuesto:", error);
      res.status(500).json({ message: "Error al guardar el presupuesto" });
    }
  },

  downloadBudgetExcel: async (req, res) => {
    try {
        const userId = req.user.userId;
        const excelBuffer = await Budget.generateExcel(userId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=presupuesto.xlsx');
        res.send(excelBuffer);
    } catch (error) {
        console.error('Error al generar el archivo Excel:', error);
        res.status(500).json({ message: 'Error al generar el archivo Excel' });
    }
},
};

module.exports = budgetController;
