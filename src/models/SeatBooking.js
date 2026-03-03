const mongoose = require('mongoose');

const seatBookingSchema = new mongoose.Schema(
  {
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      start: { type: String, required: true }, // e.g. "09:00"
      end: { type: String, required: true },   // e.g. "13:00"
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: {
      type: String,
      enum: ['booked', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
      default: 'booked',
    },
  },
  { timestamps: true }
);

seatBookingSchema.index({ seat: 1, date: 1 });
seatBookingSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('SeatBooking', seatBookingSchema);
