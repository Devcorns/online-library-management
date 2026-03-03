const router = require('express').Router();
const ctrl = require('../controllers/membershipPlanController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getPlans); // public – see available plans

router.use(authenticate);
router.get('/:id', ctrl.getPlan);
router.post('/', authorize('admin'), ctrl.createPlan);
router.put('/:id', authorize('admin'), ctrl.updatePlan);
router.delete('/:id', authorize('admin'), ctrl.deletePlan);

module.exports = router;
