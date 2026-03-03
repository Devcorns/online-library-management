const mongoose = require('mongoose');

const PLAN_TYPES = ['monthly', 'quarterly', 'yearly'];

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    planType: {
      type: String,
      enum: PLAN_TYPES,
      required: true,
    },
    durationInDays: {
      type: Number,
      required: true,
      // monthly: 30, quarterly: 90, yearly: 365 — set via API
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    gracePeriodDays: {
      type: Number,
      required: true,
      default: 5,
    },
    finePerDay: {
      type: Number,
      required: true,
      default: 10,
    },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
module.exports.PLAN_TYPES = PLAN_TYPES;
