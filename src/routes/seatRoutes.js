const router = require('express').Router();
const ctrl = require('../controllers/seatController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// Public / user routes
router.get('/', ctrl.getSeats);
router.post('/book', ctrl.bookSeat);
router.get('/my-bookings', ctrl.getMyBookings);

// Staff+ routes
router.patch('/bookings/:id/check-in', authorize('staff'), ctrl.checkIn);
router.patch('/bookings/:id/check-out', authorize('staff'), ctrl.checkOut);
router.patch('/bookings/:id/cancel', ctrl.cancelBooking);

// Admin routes
router.post('/', authorize('admin'), ctrl.createSeat);
router.get('/bookings/all', authorize('staff'), ctrl.getAllBookings);
router.get('/dashboard/occupancy', authorize('admin'), ctrl.occupancyDashboard);
router.get('/reports/daily-usage', authorize('admin'), ctrl.dailyUsageReport);

module.exports = router;
