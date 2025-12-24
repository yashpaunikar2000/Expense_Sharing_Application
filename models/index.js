const mongoose = require('mongoose');

// Export all models
module.exports = {
  User: require('./User'),
  Group: require('./Group'),
  Expense: require('./Expense'),
  Balance: require('./Balance'),
  Settlement: require('./Settlement')
};
