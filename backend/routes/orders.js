const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPaymentAndPlaceOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getUserOrdersWithPagination,
  cancelOrder,
  requestRefund,
  rateOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateAdminQuery
} = require('../middleware/validation');

// Payment routes
router.post('/create-payment-order', protect, validateCreateOrder, createPaymentOrder);
router.post('/verify-payment', protect, verifyPaymentAndPlaceOrder);

// User order management routes
router.get('/user', protect, validateAdminQuery, getUserOrdersWithPagination);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/refund', protect, requestRefund);
router.post('/:id/rate', protect, rateOrder);

// Legacy route for backward compatibility
router.get('/my-orders', protect, getUserOrders);

// Admin routes (handled by admin router now, keeping for compatibility)
router.put('/:id/status', protect, adminOnly, validateUpdateOrderStatus, updateOrderStatus);

module.exports = router;
