const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── List all users (admin+) ────────────────────────────────────────
exports.getAllUsers = asyncHandler(async (req, res) => {
  const {
    role,
    membershipStatus,
    isApproved,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (membershipStatus) filter.membershipStatus = membershipStatus;
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: users,
  });
});

// ─── Get single user ────────────────────────────────────────────────
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  res.json({ success: true, data: user });
});

// ─── Approve user registration ──────────────────────────────────────
exports.approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.isApproved) throw new AppError('User is already approved.', 400);

  user.isApproved = true;
  user.approvedBy = req.user._id;
  user.membershipStatus = 'active';
  await user.save();

  res.json({ success: true, message: 'User approved.', data: user });
});

// ─── Suspend / Reactivate user ──────────────────────────────────────
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);

  user.isActive = !user.isActive;
  if (!user.isActive) user.membershipStatus = 'suspended';
  await user.save();

  const action = user.isActive ? 'reactivated' : 'suspended';
  res.json({ success: true, message: `User ${action}.`, data: user });
});

// ─── Update user role (super_admin only) ────────────────────────────
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin', 'staff', 'user'];
  if (!validRoles.includes(role))
    throw new AppError('Invalid role.', 400);

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.role === 'super_admin')
    throw new AppError('Cannot change super admin role.', 403);

  user.role = role;
  user.isApproved = true; // auto-approve when promoted
  await user.save();

  res.json({ success: true, message: `Role updated to ${role}.`, data: user });
});

// ─── Delete user (soft) ─────────────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.role === 'super_admin')
    throw new AppError('Cannot delete super admin.', 403);

  user.isActive = false;
  await user.save();

  res.json({ success: true, message: 'User deactivated.' });
});
