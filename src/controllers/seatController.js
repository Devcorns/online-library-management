const Seat = require('../models/Seat');
const SeatBooking = require('../models/SeatBooking');
const Subscription = require('../models/Subscription');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── Helper: check user has active paid membership ──────────────────
const ensureActiveMembership = async (userId) => {
  const activeSub = await Subscription.findOne({
    user: userId,
    status: 'active',
    paymentStatus: { $in: ['paid'] },
    endDate: { $gte: new Date() },
  });
  if (!activeSub) {
    throw new AppError(
      'Cannot book seat – no active paid membership. Please renew or pay.',
      403
    );
  }
  return activeSub;
};

// ─── Create seat (admin) ────────────────────────────────────────────
exports.createSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.create(req.body);
  res.status(201).json({ success: true, data: seat });
});

// ─── Get all seats with availability ────────────────────────────────
exports.getSeats = asyncHandler(async (req, res) => {
  const { section, available } = req.query;
  const filter = { isActive: true };
  if (section) filter.section = section;
  if (available !== undefined) filter.isAvailable = available === 'true';

  const seats = await Seat.find(filter).populate('currentOccupant', 'name email');
  const totalSeats = seats.length;
  const occupied = seats.filter((s) => !s.isAvailable).length;

  res.json({
    success: true,
    count: totalSeats,
    occupied,
    available: totalSeats - occupied,
    data: seats,
  });
});

// ─── Book a seat ────────────────────────────────────────────────────
exports.bookSeat = asyncHandler(async (req, res) => {
  const { seatId, date, startTime, endTime } = req.body;
  const userId = req.user._id;

  // 1. Check membership
  await ensureActiveMembership(userId);

  // 2. Check seat exists
  const seat = await Seat.findById(seatId);
  if (!seat || !seat.isActive)
    throw new AppError('Seat not found or inactive.', 404);

  // 3. Check for overlapping bookings on the same seat/date/time
  const bookingDate = new Date(date);
  const overlap = await SeatBooking.findOne({
    seat: seatId,
    date: bookingDate,
    status: { $in: ['booked', 'checked_in'] },
    $or: [
      { 'timeSlot.start': { $lt: endTime }, 'timeSlot.end': { $gt: startTime } },
    ],
  });
  if (overlap)
    throw new AppError('Seat is already booked for that time slot.', 409);

  const booking = await SeatBooking.create({
    seat: seatId,
    user: userId,
    date: bookingDate,
    timeSlot: { start: startTime, end: endTime },
  });

  res.status(201).json({ success: true, data: booking });
});

// ─── Check-in ───────────────────────────────────────────────────────
exports.checkIn = asyncHandler(async (req, res) => {
  const booking = await SeatBooking.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found.', 404);
  if (booking.status !== 'booked')
    throw new AppError(`Cannot check in – status is "${booking.status}".`, 400);

  booking.status = 'checked_in';
  booking.checkInTime = new Date();
  await booking.save();

  // Mark seat as occupied
  await Seat.findByIdAndUpdate(booking.seat, {
    isAvailable: false,
    currentOccupant: booking.user,
  });

  res.json({ success: true, message: 'Checked in.', data: booking });
});

// ─── Check-out ──────────────────────────────────────────────────────
exports.checkOut = asyncHandler(async (req, res) => {
  const booking = await SeatBooking.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found.', 404);
  if (booking.status !== 'checked_in')
    throw new AppError(`Cannot check out – status is "${booking.status}".`, 400);

  booking.status = 'checked_out';
  booking.checkOutTime = new Date();
  await booking.save();

  // Free up seat
  await Seat.findByIdAndUpdate(booking.seat, {
    isAvailable: true,
    currentOccupant: null,
  });

  res.json({ success: true, message: 'Checked out.', data: booking });
});

// ─── Cancel booking ─────────────────────────────────────────────────
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await SeatBooking.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found.', 404);
  if (['checked_out', 'cancelled'].includes(booking.status))
    throw new AppError('Booking already completed/cancelled.', 400);

  booking.status = 'cancelled';
  await booking.save();

  // If was checked-in, free seat
  if (booking.status === 'checked_in') {
    await Seat.findByIdAndUpdate(booking.seat, {
      isAvailable: true,
      currentOccupant: null,
    });
  }

  res.json({ success: true, message: 'Booking cancelled.', data: booking });
});

// ─── My bookings (user) ─────────────────────────────────────────────
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await SeatBooking.find({ user: req.user._id })
    .populate('seat', 'seatNumber section')
    .sort({ date: -1 });
  res.json({ success: true, count: bookings.length, data: bookings });
});

// ─── All bookings (admin) ───────────────────────────────────────────
exports.getAllBookings = asyncHandler(async (req, res) => {
  const { date, status, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (date) filter.date = new Date(date);
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    SeatBooking.find(filter)
      .populate('seat', 'seatNumber section')
      .populate('user', 'name email')
      .sort({ date: -1, 'timeSlot.start': 1 })
      .skip(skip)
      .limit(Number(limit)),
    SeatBooking.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: bookings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: bookings,
  });
});

// ─── Occupancy dashboard (admin) ────────────────────────────────────
exports.occupancyDashboard = asyncHandler(async (_req, res) => {
  const totalSeats = await Seat.countDocuments({ isActive: true });
  const occupied = await Seat.countDocuments({ isActive: true, isAvailable: false });
  const available = totalSeats - occupied;
  const occupancyRate = totalSeats > 0 ? ((occupied / totalSeats) * 100).toFixed(1) : 0;

  // Today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayBookings = await SeatBooking.countDocuments({
    date: { $gte: today, $lt: tomorrow },
    status: { $ne: 'cancelled' },
  });

  res.json({
    success: true,
    data: {
      totalSeats,
      occupied,
      available,
      occupancyRate: `${occupancyRate}%`,
      todayBookings,
    },
  });
});

// ─── Daily seat usage report ────────────────────────────────────────
exports.dailyUsageReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { status: { $in: ['checked_in', 'checked_out'] } };
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }

  const report = await SeatBooking.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalBookings: { $sum: 1 },
        checkedIn: {
          $sum: { $cond: [{ $eq: ['$status', 'checked_in'] }, 1, 0] },
        },
        checkedOut: {
          $sum: { $cond: [{ $eq: ['$status', 'checked_out'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  res.json({ success: true, data: report });
});
