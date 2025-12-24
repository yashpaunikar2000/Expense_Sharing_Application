const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    from: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      email: {
        type: String,
        required: true
      }
    },
    to: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      email: {
        type: String,
        required: true
      }
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: 'Payment settlement'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    settledDate: {
      type: Date,
      default: null
    },
    settlementMethod: {
      type: String,
      enum: ['cash', 'transfer', 'credit_card', 'other'],
      default: 'cash'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settlement', settlementSchema);
