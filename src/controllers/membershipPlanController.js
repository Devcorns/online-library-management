const MembershipPlan = require('../models/MembershipPlan');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── Create plan ────────────────────────────────────────────────────
exports.createPlan = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const plan = await MembershipPlan.create(req.body);
  res.status(201).json({ success: true, data: plan });
});

// ─── Get all plans ──────────────────────────────────────────────────
exports.getPlans = asyncHandler(async (_req, res) => {
  const plans = await MembershipPlan.find({ isActive: true }).sort('fee');
  res.json({ success: true, count: plans.length, data: plans });
});

// ─── Get single plan ────────────────────────────────────────────────
exports.getPlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findById(req.params.id);
  if (!plan) throw new AppError('Plan not found.', 404);
  res.json({ success: true, data: plan });
});

// ─── Update plan ────────────────────────────────────────────────────
exports.updatePlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!plan) throw new AppError('Plan not found.', 404);
  res.json({ success: true, data: plan });
});

// ─── Delete (soft) ──────────────────────────────────────────────────
exports.deletePlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!plan) throw new AppError('Plan not found.', 404);
  res.json({ success: true, message: 'Plan deactivated.' });
});
