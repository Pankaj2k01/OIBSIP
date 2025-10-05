const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Import controllers
const {
  getDashboardOverview,
  getInventoryOverview,
  updateInventoryItem,
  getAllOrders,
  updateOrderStatus,
  getSalesAnalytics
} = require('../controllers/adminController');

// Import inventory monitoring service
const { inventoryMonitor } = require('../services/inventoryMonitor');

// Import middleware
const { protect, adminOnly } = require('../middleware/auth');
const {
  validateInventoryUpdate,
  validateOrderStatusUpdate,
  validateAdminQuery
} = require('../middleware/validation');

// Rate limiting for admin operations
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs for admin
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const updateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 update requests per minute
  message: {
    success: false,
    message: 'Too many update requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all admin routes
router.use(adminLimiter);

// Apply authentication and admin check to all routes
router.use(protect);
router.use(adminOnly);

/**
 * Dashboard Routes
 */

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview with key metrics
// @access  Private/Admin
router.get('/dashboard', getDashboardOverview);

// @route   GET /api/admin/analytics
// @desc    Get sales analytics and reports
// @access  Private/Admin
router.get('/analytics', validateAdminQuery, getSalesAnalytics);

/**
 * Inventory Management Routes
 */

// @route   GET /api/admin/inventory
// @desc    Get complete inventory overview
// @access  Private/Admin
router.get('/inventory', getInventoryOverview);

// @route   PUT /api/admin/inventory/:type/:id
// @desc    Update inventory item (stock, threshold, price, availability)
// @access  Private/Admin
router.put('/inventory/:type/:id', 
  updateLimiter,
  validateInventoryUpdate,
  updateInventoryItem
);

// @route   GET /api/admin/inventory/monitor/status
// @desc    Get inventory monitoring status
// @access  Private/Admin
router.get('/inventory/monitor/status', (req, res) => {
  try {
    const status = inventoryMonitor.getStatus();
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get monitoring status'
    });
  }
});

// @route   POST /api/admin/inventory/monitor/check
// @desc    Trigger manual inventory check
// @access  Private/Admin
router.post('/inventory/monitor/check', async (req, res) => {
  try {
    const result = await inventoryMonitor.manualCheck();
    res.status(200).json({
      success: true,
      message: 'Manual inventory check completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to run manual inventory check'
    });
  }
});

/**
 * Order Management Routes
 */

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and pagination
// @access  Private/Admin
router.get('/orders', validateAdminQuery, getAllOrders);

// @route   PUT /api/admin/orders/:orderId/status
// @desc    Update order status and add tracking info
// @access  Private/Admin
router.put('/orders/:orderId/status',
  updateLimiter,
  validateOrderStatusUpdate,
  updateOrderStatus
);

/**
 * Bulk Operations Routes (for future enhancement)
 */

// @route   PUT /api/admin/inventory/bulk-update
// @desc    Bulk update multiple inventory items
// @access  Private/Admin
router.put('/inventory/bulk-update', updateLimiter, (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Bulk update feature coming soon'
  });
});

// @route   POST /api/admin/reports/export
// @desc    Export sales/inventory reports
// @access  Private/Admin
router.post('/reports/export', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Report export feature coming soon'
  });
});

/**
 * Error handling for invalid admin routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Admin route ${req.originalUrl} not found`
  });
});

module.exports = router;