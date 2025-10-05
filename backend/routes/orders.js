const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPaymentAndPlaceOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  handleWebhook,
  getUserOrdersWithPagination,
  cancelOrder,
  requestRefund,
  rateOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const {
  validateOrderCreation,
  validatePaymentVerification,
  validateOrderStatusUpdate,
  validateAdminQuery
} = require('../middleware/validation');

// Payment routes
router.post('/create-payment-order', protect, validateOrderCreation, createPaymentOrder);
router.post('/verify-payment', protect, validatePaymentVerification, verifyPaymentAndPlaceOrder);
router.post('/webhook', handleWebhook); // No auth needed for webhook

// User order management routes
router.get('/user', protect, validateAdminQuery, getUserOrdersWithPagination);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/refund', protect, requestRefund);
router.post('/:id/rate', protect, rateOrder);

// Legacy route for backward compatibility
router.get('/my-orders', protect, getUserOrders);

// Admin routes (handled by admin router now, keeping for compatibility)
router.put('/:id/status', protect, adminOnly, validateOrderStatusUpdate, updateOrderStatus);

module.exports = router;
