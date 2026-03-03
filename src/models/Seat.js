const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: 'General',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // If a user is currently checked-in
    currentOccupant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    features: {
      type: [String], // e.g. ['power_outlet', 'window', 'ac']
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seat', seatSchema);
