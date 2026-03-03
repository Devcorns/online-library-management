const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// Items
router.get('/items', authorize('staff'), ctrl.getItems);
router.get('/items/low-stock', authorize('staff'), ctrl.getLowStockAlerts);
router.get('/items/:id', authorize('staff'), ctrl.getItem);
router.post('/items', authorize('admin'), ctrl.createItem);
router.put('/items/:id', authorize('admin'), ctrl.updateItem);
router.delete('/items/:id', authorize('admin'), ctrl.deleteItem);

// Requisitions
router.get('/requisitions', authorize('staff'), ctrl.getRequisitions);
router.post('/requisitions', authorize('staff'), ctrl.createRequisition);
router.patch('/requisitions/:id/review', authorize('admin'), ctrl.reviewRequisition);

module.exports = router;
