const router = require('express').Router();
const ctrl = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate); // all routes require login

router.get('/', authorize('staff'), ctrl.getAllUsers);
router.get('/:id', authorize('staff'), ctrl.getUser);
router.patch('/:id/approve', authorize('admin'), ctrl.approveUser);
router.patch('/:id/toggle-status', authorize('admin'), ctrl.toggleUserStatus);
router.patch('/:id/role', authorize('super_admin'), ctrl.updateUserRole);
router.delete('/:id', authorize('admin'), ctrl.deleteUser);

module.exports = router;
