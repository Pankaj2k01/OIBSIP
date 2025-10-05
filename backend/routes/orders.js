const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../middleware/validation');

// User routes
router.post('/create-payment-order', protect, validateCreateOrder, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, validateUpdateOrderStatus, updateOrderStatus);

module.exports = router;