const router = require('express').Router();
const ctrl = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, ctrl.updateMe);
router.put('/change-password', authenticate, ctrl.changePassword);

module.exports = router;
