const Subscription = require('../models/Subscription');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { calculateFine } = require('../services/fineService');
const { generateReceiptNumber } = require('../utils/receiptHelper');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── Create subscription for a user ────────────────────────────────
exports.createSubscription = asyncHandler(async (req, res) => {
  const { userId, planId, startDate } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  if (!user.isApproved) throw new AppError('User not approved yet.', 400);

  const plan = await MembershipPlan.findById(planId);
  if (!plan || !plan.isActive) throw new AppError('Plan not found or inactive.', 404);

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + plan.durationInDays);

  const subscription = await Subscription.create({
    user: userId,
    plan: planId,
    startDate: start,
    endDate: end,
    feeDueDate: start, // fee is due on subscription start
    amountDue: plan.fee,
    totalAmount: plan.fee,
    createdBy: req.user._id,
  });

  // Update user membership status
  user.membershipStatus = 'active';
  await user.save();

  res.status(201).json({ success: true, data: subscription });
});

// ─── Renew subscription ─────────────────────────────────────────────
exports.renewSubscription = asyncHandler(async (req, res) => {
  const { userId, planId } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  // Expire any current active subscription
  await Subscription.updateMany(
    { user: userId, status: 'active' },
    { status: 'expired' }
  );

  const plan = await MembershipPlan.findById(planId);
  if (!plan || !plan.isActive) throw new AppError('Plan not found or inactive.', 404);

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + plan.durationInDays);

  const subscription = await Subscription.create({
    user: userId,
    plan: planId,
    startDate: start,
    endDate: end,
    feeDueDate: start,
    amountDue: plan.fee,
    totalAmount: plan.fee,
    createdBy: req.user._id,
  });

  user.membershipStatus = 'active';
  await user.save();

  res.status(201).json({ success: true, data: subscription });
});

// ─── Record payment (auto fine calculation) ─────────────────────────
exports.recordPayment = asyncHandler(async (req, res) => {
  const { subscriptionId, amount, paymentMethod, notes } = req.body;

  const subscription = await Subscription.findById(subscriptionId).populate('plan');
  if (!subscription) throw new AppError('Subscription not found.', 404);

  // --- Auto fine calculation ---
  const { fine, daysLate, isOverdue } = calculateFine({
    feeDueDate: subscription.feeDueDate,
    gracePeriodDays: subscription.plan.gracePeriodDays,
    finePerDay: subscription.plan.finePerDay,
  });

  subscription.fineAmount = fine;
  subscription.totalAmount = subscription.amountDue + fine;

  // Payment
  const paidSoFar = subscription.amountPaid + amount;
  subscription.amountPaid = paidSoFar;

  if (paidSoFar >= subscription.totalAmount) {
    subscription.paymentStatus = 'paid';
    subscription.paymentDate = new Date();
  } else {
    subscription.paymentStatus = 'partial';
  }

  const receiptNumber = generateReceiptNumber();
  subscription.receiptNumber = receiptNumber;
  await subscription.save();

  // Create payment record
  const payment = await Payment.create({
    subscription: subscription._id,
    user: subscription.user,
    amount,
    feeComponent: Math.min(amount, subscription.amountDue - (subscription.amountPaid - amount)),
    fineComponent: Math.max(0, amount - subscription.amountDue + (subscription.amountPaid - amount)),
    paymentMethod: paymentMethod || 'cash',
    receiptNumber,
    notes,
    collectedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: isOverdue
      ? `Payment recorded. Late by ${daysLate} days – fine ₹${fine} applied.`
      : 'Payment recorded. No fine applicable.',
    data: { subscription, payment },
  });
});

// ─── Get subscription with fine preview ─────────────────────────────
exports.getSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('plan')
    .populate('user', 'name email');
  if (!subscription) throw new AppError('Subscription not found.', 404);

  // Live fine preview
  const { fine, daysLate, isOverdue } = calculateFine({
    feeDueDate: subscription.feeDueDate,
    gracePeriodDays: subscription.plan.gracePeriodDays,
    finePerDay: subscription.plan.finePerDay,
  });

  res.json({
    success: true,
    data: subscription,
    finePreview: { fine, daysLate, isOverdue },
  });
});

// ─── Get user subscriptions ─────────────────────────────────────────
exports.getUserSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.params.userId })
    .populate('plan')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: subscriptions.length, data: subscriptions });
});

// ─── List all subscriptions (admin) ─────────────────────────────────
exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const { status, paymentStatus, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const [subscriptions, total] = await Promise.all([
    Subscription.find(filter)
      .populate('user', 'name email')
      .populate('plan', 'name planType fee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Subscription.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: subscriptions.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: subscriptions,
  });
});

// ─── Revenue report ─────────────────────────────────────────────────
exports.revenueReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { paymentStatus: 'paid' };
  if (from || to) {
    match.paymentDate = {};
    if (from) match.paymentDate.$gte = new Date(from);
    if (to) match.paymentDate.$lte = new Date(to);
  }

  const report = await Subscription.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amountPaid' },
        totalFines: { $sum: '$fineAmount' },
        totalFees: { $sum: '$amountDue' },
        count: { $sum: 1 },
      },
    },
  ]);

  const monthlyBreakdown = await Subscription.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
        },
        revenue: { $sum: '$amountPaid' },
        fines: { $sum: '$fineAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
  ]);

  res.json({
    success: true,
    data: {
      summary: report[0] || { totalRevenue: 0, totalFines: 0, totalFees: 0, count: 0 },
      monthlyBreakdown,
    },
  });
});
