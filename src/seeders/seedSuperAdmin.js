/**
 * Seed the first Super Admin account.
 * Run once:  npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  const exists = await User.findOne({ role: 'super_admin' });
  if (exists) {
    console.log('Super Admin already exists – skipping seed.');
    process.exit(0);
  }

  await User.create({
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@library.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
    role: 'super_admin',
    isApproved: true,
    membershipStatus: 'active',
  });

  console.log('Super Admin seeded successfully.');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
