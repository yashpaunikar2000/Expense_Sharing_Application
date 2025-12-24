const express = require('express');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// Expense routes
router.post('/:groupId/expenses', expenseController.addExpense);
router.get('/:groupId/expenses', expenseController.getGroupExpenses);
router.get('/expenses/:expenseId', expenseController.getExpenseDetails);
router.put('/expenses/:expenseId', expenseController.updateExpense);
router.delete('/expenses/:expenseId', expenseController.deleteExpense);
router.get('/:groupId/expenses/category', expenseController.getExpensesByCategory);
router.get('/:groupId/expenses/user', expenseController.getUserExpenses);

module.exports = router;
