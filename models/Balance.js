const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    owedTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        userEmail: {
          type: String,
          required: true
        },
        amount: {
          type: Number,
          required: true,
          default: 0
        }
      }
    ],
    owedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        userEmail: {
          type: String,
          required: true
        },
        amount: {
          type: Number,
          required: true,
          default: 0
        }
      }
    ],
    totalOwed: {
      type: Number,
      default: 0
    },
    totalOwes: {
      type: Number,
      default: 0
    },
    netBalance: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for quick lookup
balanceSchema.index({ group: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Balance', balanceSchema);
