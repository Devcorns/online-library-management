const InventoryItem = require('../models/InventoryItem');
const Requisition = require('../models/Requisition');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ═══════════════════  INVENTORY ITEMS  ═══════════════════════════════

exports.createItem = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  req.body.availableQuantity = req.body.availableQuantity ?? req.body.totalQuantity;
  const item = await InventoryItem.create(req.body);
  res.status(201).json({ success: true, data: item });
});

exports.getItems = asyncHandler(async (req, res) => {
  const { category, lowStock, search } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };

  let items = await InventoryItem.find(filter).sort('name');
  if (lowStock === 'true') {
    items = items.filter((i) => i.isLowStock);
  }

  res.json({ success: true, count: items.length, data: items });
});

exports.getItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) throw new AppError('Item not found.', 404);
  res.json({ success: true, data: item });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new AppError('Item not found.', 404);
  res.json({ success: true, data: item });
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!item) throw new AppError('Item not found.', 404);
  res.json({ success: true, message: 'Item deactivated.' });
});

exports.getLowStockAlerts = asyncHandler(async (_req, res) => {
  const items = await InventoryItem.find({ isActive: true });
  const alerts = items.filter((i) => i.isLowStock);
  res.json({ success: true, count: alerts.length, data: alerts });
});

// ═══════════════════  REQUISITIONS  ══════════════════════════════════

exports.createRequisition = asyncHandler(async (req, res) => {
  req.body.requestedBy = req.user._id;
  const requisition = await Requisition.create(req.body);
  res
    .status(201)
    .json({ success: true, data: requisition });
});

exports.getRequisitions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const requisitions = await Requisition.find(filter)
    .populate('item', 'name category')
    .populate('requestedBy', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: requisitions.length, data: requisitions });
});

exports.reviewRequisition = asyncHandler(async (req, res) => {
  const { status, reviewNotes } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status))
    throw new AppError('Status must be approved or rejected.', 400);

  const requisition = await Requisition.findById(req.params.id).populate('item');
  if (!requisition) throw new AppError('Requisition not found.', 404);
  if (requisition.status !== 'pending')
    throw new AppError('Requisition already reviewed.', 400);

  requisition.status = status;
  requisition.reviewedBy = req.user._id;
  requisition.reviewNotes = reviewNotes;
  requisition.reviewedAt = new Date();

  // If approved, increase available quantity
  if (status === 'approved' && requisition.item) {
    const item = await InventoryItem.findById(requisition.item._id);
    item.totalQuantity += requisition.requestedQuantity;
    item.availableQuantity += requisition.requestedQuantity;
    await item.save();
    requisition.status = 'fulfilled';
  }

  await requisition.save();
  res.json({ success: true, data: requisition });
});
