const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Helper – sign JWT
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Helper – send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);
  const userData = user.toJSON();
  res.status(statusCode).json({ success: true, token, data: userData });
};

// ─── Register (public) ──────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered.', 400);

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: 'user',
    isApproved: false,
    membershipStatus: 'pending',
  });

  res.status(201).json({
    success: true,
    message:
      'Registration successful. Your account is pending admin approval.',
    data: user.toJSON(),
  });
});

// ─── Login ──────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError('Please provide email and password.', 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid credentials.', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid credentials.', 401);

  if (!user.isActive) throw new AppError('Account is deactivated.', 403);

  if (!user.isApproved && user.role === 'user')
    throw new AppError('Account pending approval by admin.', 403);

  sendTokenResponse(user, 200, res);
});

// ─── Get current user profile ───────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// ─── Update own profile ─────────────────────────────────────────────
exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'address'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: user });
});

// ─── Change password ────────────────────────────────────────────────
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword)))
    throw new AppError('Current password is incorrect.', 400);

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
