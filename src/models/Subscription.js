const mongoose = require('mongoose');

/**
 * Each document represents one subscription period for a user.
 * When a user renews, a NEW Subscription document is created.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    // Due date for fee payment (usually = startDate  for new,  endDate of prev for renewal)
    feeDueDate: {
      type: Date,
      required: true,
    },
    amountDue: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number, // amountDue + fineAmount
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'partial', 'overdue'],
      default: 'unpaid',
    },
    paymentDate: { type: Date },
    receiptNumber: { type: String },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
