const router = require('express').Router();
const ctrl = require('../controllers/subscriptionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', authorize('staff'), ctrl.getAllSubscriptions);
router.get('/revenue-report', authorize('admin'), ctrl.revenueReport);
router.get('/user/:userId', authorize('staff'), ctrl.getUserSubscriptions);
router.get('/:id', authorize('staff'), ctrl.getSubscription);

router.post('/', authorize('staff'), ctrl.createSubscription);
router.post('/renew', authorize('staff'), ctrl.renewSubscription);
router.post('/payment', authorize('staff'), ctrl.recordPayment);

module.exports = router;
