const { Balance, Expense, User } = require('../models');

/**
 * Calculate split amounts based on split type
 * @param {number} totalAmount - Total expense amount
 * @param {string} splitType - Type of split (equal, exact, percentage)
 * @param {array} splitData - Split data for each user
 * @returns {array} - Array with calculated amounts for each user
 */
const calculateSplit = (totalAmount, splitType, splitData) => {
  const splits = [];

  if (splitType === 'equal') {
    const equalAmount = totalAmount / splitData.length;
    splitData.forEach((data) => {
      splits.push({
        userId: data.userId,
        email: data.email,
        amount: parseFloat(equalAmount.toFixed(2))
      });
    });
  } else if (splitType === 'exact') {
    splitData.forEach((data) => {
      splits.push({
        userId: data.userId,
        email: data.email,
        amount: parseFloat(data.amount.toFixed(2))
      });
    });
  } else if (splitType === 'percentage') {
    splitData.forEach((data) => {
      const percentageAmount = (totalAmount * data.percentage) / 100;
      splits.push({
        userId: data.userId,
        email: data.email,
        amount: parseFloat(percentageAmount.toFixed(2))
      });
    });
  }

  return splits;
};

/**
 * Update balance after adding an expense
 * @param {string} groupId - Group ID
 * @param {string} paidById - User ID who paid
 * @param {array} splits - Split array with userId and amount
 */
const updateBalanceAfterExpense = async (groupId, paidById, splits, paidByEmail) => {
  try {
    // Update balance for the user who paid
    let paidByBalance = await Balance.findOne({ group: groupId, user: paidById });

    // Ensure we have payer email
    let resolvedPaidByEmail = paidByEmail;
    if (!resolvedPaidByEmail) {
      const payer = await User.findById(paidById).select('email');
      resolvedPaidByEmail = payer?.email;
    }

    if (!paidByBalance) {
      paidByBalance = new Balance({
        group: groupId,
        user: paidById,
        userEmail: resolvedPaidByEmail,
        owedTo: [],
        owedBy: [],
        totalOwed: 0,
        totalOwes: 0,
        netBalance: 0
      });
    }

    // Update balance for each person in the split
    for (const split of splits) {
      if (split.userId.toString() !== paidById.toString()) {
        // This person owes the payer
        const userBalance = await Balance.findOne({
          group: groupId,
          user: split.userId
        });

        // Ensure split email is available
        let resolvedSplitEmail = split.email;
        if (!resolvedSplitEmail) {
          const u = await User.findById(split.userId).select('email');
          resolvedSplitEmail = u?.email;
        }

        if (!userBalance) {
          const newBalance = new Balance({
            group: groupId,
            user: split.userId,
            userEmail: resolvedSplitEmail,
            owedTo: [
              {
                userId: paidById,
                userEmail: resolvedPaidByEmail,
                amount: split.amount
              }
            ],
            owedBy: [],
            totalOwed: split.amount,
            totalOwes: 0,
            netBalance: -split.amount
          });
          await newBalance.save();
        } else {
          // Check if already owes to this person
          const existingDebt = userBalance.owedTo.findIndex(
            (debt) => debt.userId.toString() === paidById.toString()
          );

          if (existingDebt !== -1) {
            userBalance.owedTo[existingDebt].amount += split.amount;
          } else {
            userBalance.owedTo.push({
              userId: paidById,
              userEmail: resolvedPaidByEmail,
              amount: split.amount
            });
          }

          userBalance.totalOwed = userBalance.owedTo.reduce((sum, debt) => sum + debt.amount, 0);
          userBalance.netBalance = userBalance.totalOwes - userBalance.totalOwed;
          await userBalance.save();
        }

        // Update the payer's balance (they are owed money)
        const existingCredit = paidByBalance.owedBy.findIndex(
          (credit) => credit.userId.toString() === split.userId.toString()
        );

        if (existingCredit !== -1) {
          paidByBalance.owedBy[existingCredit].amount += split.amount;
        } else {
          paidByBalance.owedBy.push({
            userId: split.userId,
            userEmail: resolvedSplitEmail,
            amount: split.amount
          });
        }
      }
    }

    paidByBalance.totalOwes = paidByBalance.owedBy.reduce((sum, credit) => sum + credit.amount, 0);
    paidByBalance.netBalance = paidByBalance.totalOwes - paidByBalance.totalOwed;
    await paidByBalance.save();
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error;
  }
};

/**
 * Calculate simple settlement suggestions
 * @param {string} groupId - Group ID
 */
const generateSettlementSuggestions = async (groupId) => {
  try {
    const balances = await Balance.find({ group: groupId });
    const suggestions = [];

    // Find who owes whom
    balances.forEach((balance) => {
      if (balance.netBalance < 0) {
        // This person owes money
        balance.owedTo.forEach((debt) => {
          suggestions.push({
            from: balance.userEmail,
            fromId: balance.user,
            to: debt.userEmail,
            toId: debt.userId,
            amount: debt.amount
          });
        });
      }
    });

    return suggestions;
  } catch (error) {
    console.error('Error generating settlement suggestions:', error);
    throw error;
  }
};

/**
 * Get user's balance in a group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 */
const getUserGroupBalance = async (groupId, userId) => {
  try {
    const balance = await Balance.findOne({ group: groupId, user: userId });

    if (!balance) {
      return {
        totalOwed: 0,
        totalOwes: 0,
        netBalance: 0,
        owedTo: [],
        owedBy: []
      };
    }

    return {
      totalOwed: balance.totalOwed,
      totalOwes: balance.totalOwes,
      netBalance: balance.netBalance,
      owedTo: balance.owedTo,
      owedBy: balance.owedBy
    };
  } catch (error) {
    console.error('Error getting user group balance:', error);
    throw error;
  }
};

module.exports = {
  calculateSplit,
  updateBalanceAfterExpense,
  generateSettlementSuggestions,
  getUserGroupBalance
};
