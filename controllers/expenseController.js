const { Expense, Balance, Group } = require('../models');
const { validateCreateExpense } = require('../utils/validators');
const { calculateSplit, updateBalanceAfterExpense } = require('../utils/balanceCalculator');

/**
 * Add expense to a group
 */
const addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      description,
      amount,
      paidBy,
      splitType,
      splits,
      category,
      date,
      notes
    } = req.body;

    // ✅ Validate input
    const validation = validateCreateExpense({
      description,
      amount,
      paidBy,
      splitType,
      splits,
      date
    });

    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // ✅ Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // ✅ Calculate splits (amount per user)
    const calculatedSplits = calculateSplit(amount, splitType, splits);

    // ✅ Create expense
    const newExpense = new Expense({
      description,
      amount,
      paidBy,
      group: groupId,
      splitType, // must be: equal | exact | percentage
      splits: calculatedSplits,
      category,
      date,
      notes,
      isSettled: false
    });

    const savedExpense = await newExpense.save();

    // ✅ Add expense reference to group
    group.expenses.push(savedExpense._id);
    await group.save();

    // ✅ Update balances (NO EMAIL)
    await updateBalanceAfterExpense(groupId, paidBy, calculatedSplits);

    res.status(201).json({
      message: 'Expense added successfully',
      data: savedExpense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Error adding expense' });
  }
};

/**
 * Get all expenses in a group
 */
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('splits.userId', 'name email')
      .sort({ date: -1 });

    res.json({
      message: 'Expenses retrieved successfully',
      data: expenses
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

/**
 * Get expense details
 */
const getExpenseDetails = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId)
      .populate('paidBy', 'name email')
      .populate('splits.userId', 'name email')
      .populate('group', 'name');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      message: 'Expense details retrieved successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error fetching expense details:', error);
    res.status(500).json({ error: 'Error fetching expense details' });
  }
};

/**
 * Update expense
 */
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { description, amount, category, notes } = req.body;

    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      { description, amount, category, notes },
      { new: true }
    )
      .populate('paidBy', 'name email')
      .populate('splits.userId', 'name email');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Error updating expense' });
  }
};

/**
 * Delete expense
 */
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByIdAndDelete(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // remove from group
    await Group.findByIdAndUpdate(expense.group, {
      $pull: { expenses: expenseId }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Error deleting expense' });
  }
};

/**
 * Get expenses by category
 */
const getExpensesByCategory = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { category } = req.query;

    const expenses = await Expense.find({ group: groupId, category })
      .populate('paidBy', 'name email')
      .sort({ date: -1 });

    res.json({
      message: 'Expenses by category retrieved successfully',
      data: expenses
    });
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    res.status(500).json({ error: 'Error fetching expenses by category' });
  }
};

/**
 * Get user's expenses in a group
 */
const getUserExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    const expenses = await Expense.find({
      group: groupId,
      $or: [{ paidBy: userId }, { 'splits.userId': userId }]
    })
      .populate('paidBy', 'name email')
      .populate('splits.userId', 'name email')
      .sort({ date: -1 });

    res.json({
      message: 'User expenses retrieved successfully',
      data: expenses
    });
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    res.status(500).json({ error: 'Error fetching user expenses' });
  }
};

module.exports = {
  addExpense,
  getGroupExpenses,
  getExpenseDetails,
  updateExpense,
  deleteExpense,
  getExpensesByCategory,
  getUserExpenses
};
