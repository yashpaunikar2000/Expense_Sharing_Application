const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage'],
      required: true
    },
    splits: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        email: {
          type: String,
          required: true
        },
        amount: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    category: {
      type: String,
      enum: ['food', 'groceries', 'utilities', 'entertainment', 'transport', 'shopping', 'other'],
      default: 'other'
    },
    date: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    isSettled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
