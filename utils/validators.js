const validateCreateGroup = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Group name is required');
  }

  // if (!Array.isArray(data.members) || data.members.length === 0) {
  //   errors.push('At least one member is required');
  // }

  if (data.members) {
    data.members.forEach((member, index) => {
      if (!member.userId && !member.email) {
        errors.push(`Member ${index + 1}: Either userId or email is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateCreateExpense = (data) => {
  const errors = [];

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Expense description is required');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!data.paidBy) {
    errors.push('Payer information is required');
  }

  if (!data.splitType || !['equal', 'exact', 'percentage'].includes(data.splitType)) {
    errors.push('Invalid split type');
  }

  if (!data.splits || !Array.isArray(data.splits) || data.splits.length === 0) {
    errors.push('At least one split is required');
  }

  if (!data.date) {
    errors.push('Expense date is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateSettlement = (data) => {
  const errors = [];

  if (!data.from || !data.from.userId) {
    errors.push('From user is required');
  }

  if (!data.to || !data.to.userId) {
    errors.push('To user is required');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (data.from && data.to && data.from.userId === data.to.userId) {
    errors.push('Cannot settle payment to yourself');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateCreateGroup,
  validateCreateExpense,
  validateSettlement
};
