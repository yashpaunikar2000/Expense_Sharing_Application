const { Balance, Settlement } = require('../models');
const { getUserGroupBalance, generateSettlementSuggestions } = require('../utils/balanceCalculator');
const { validateSettlement } = require('../utils/validators');

/**
 * Get user's balance in a group
 */
const getUserBalance = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    const balance = await getUserGroupBalance(groupId, userId);

    res.json({
      message: 'Balance retrieved successfully',
      data: balance
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Error fetching balance' });
  }
};

/**
 * Get all balances in a group
 */
const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const balances = await Balance.find({ group: groupId })
      .populate('user', 'name email')
      .populate('owedTo.userId', 'name email')
      .populate('owedBy.userId', 'name email');

    res.json({
      message: 'Group balances retrieved successfully',
      data: balances
    });
  } catch (error) {
    console.error('Error fetching group balances:', error);
    res.status(500).json({ error: 'Error fetching group balances' });
  }
};

/**
 * Get settlement suggestions for a group
 */
const getSettlementSuggestions = async (req, res) => {
  try {
    const { groupId } = req.params;

    const suggestions = await generateSettlementSuggestions(groupId);

    res.json({
      message: 'Settlement suggestions generated successfully',
      data: suggestions
    });
  } catch (error) {
    console.error('Error generating settlement suggestions:', error);
    res.status(500).json({ error: 'Error generating settlement suggestions' });
  }
};

/**
 * Record a settlement
 */
const recordSettlement = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { from, to, amount, description, settlementMethod, notes } = req.body;

    // Validate input
    const validation = validateSettlement({ from, to, amount });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Create settlement
    const settlement = new Settlement({
      group: groupId,
      from: {
        userId: from.userId,
        email: from.email
      },
      to: {
        userId: to.userId,
        email: to.email
      },
      amount,
      description,
      status: 'completed',
      settlementMethod,
      notes,
      settledDate: new Date()
    });

    const savedSettlement = await settlement.save();

    // Update balances
    const fromBalance = await Balance.findOne({ group: groupId, user: from.userId });
    const toBalance = await Balance.findOne({ group: groupId, user: to.userId });

    if (fromBalance && toBalance) {
      // Reduce debt for the person who paid
      fromBalance.owedTo = fromBalance.owedTo.map((debt) => {
        if (debt.userId.toString() === to.userId.toString()) {
          return {
            ...debt,
            amount: Math.max(0, debt.amount - amount)
          };
        }
        return debt;
      });

      // Remove zero debts
      fromBalance.owedTo = fromBalance.owedTo.filter((debt) => debt.amount > 0);
      fromBalance.totalOwed = fromBalance.owedTo.reduce((sum, debt) => sum + debt.amount, 0);
      fromBalance.netBalance = fromBalance.totalOwes - fromBalance.totalOwed;

      // Reduce credit for the person who received payment
      toBalance.owedBy = toBalance.owedBy.map((credit) => {
        if (credit.userId.toString() === from.userId.toString()) {
          return {
            ...credit,
            amount: Math.max(0, credit.amount - amount)
          };
        }
        return credit;
      });

      // Remove zero credits
      toBalance.owedBy = toBalance.owedBy.filter((credit) => credit.amount > 0);
      toBalance.totalOwes = toBalance.owedBy.reduce((sum, credit) => sum + credit.amount, 0);
      toBalance.netBalance = toBalance.totalOwes - toBalance.totalOwed;

      await fromBalance.save();
      await toBalance.save();
    }

    res.status(201).json({
      message: 'Settlement recorded successfully',
      data: savedSettlement
    });
  } catch (error) {
    console.error('Error recording settlement:', error);
    res.status(500).json({ error: 'Error recording settlement' });
  }
};

/**
 * Get all settlements in a group
 */
const getGroupSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;

    const settlements = await Settlement.find({ group: groupId })
      .populate('from.userId', 'name email')
      .populate('to.userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Settlements retrieved successfully',
      data: settlements
    });
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ error: 'Error fetching settlements' });
  }
};

/**
 * Get user's settlement history in a group
 */
const getUserSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    const settlements = await Settlement.find({
      group: groupId,
      $or: [
        { 'from.userId': userId },
        { 'to.userId': userId }
      ]
    })
      .populate('from.userId', 'name email')
      .populate('to.userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'User settlements retrieved successfully',
      data: settlements
    });
  } catch (error) {
    console.error('Error fetching user settlements:', error);
    res.status(500).json({ error: 'Error fetching user settlements' });
  }
};

/**
 * Get settlement details
 */
const getSettlementDetails = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await Settlement.findById(settlementId)
      .populate('from.userId', 'name email')
      .populate('to.userId', 'name email')
      .populate('group', 'name');

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    res.json({
      message: 'Settlement details retrieved successfully',
      data: settlement
    });
  } catch (error) {
    console.error('Error fetching settlement details:', error);
    res.status(500).json({ error: 'Error fetching settlement details' });
  }
};

module.exports = {
  getUserBalance,
  getGroupBalances,
  getSettlementSuggestions,
  recordSettlement,
  getGroupSettlements,
  getUserSettlements,
  getSettlementDetails
};
