const User = require('../models/User');
const Order = require('../models/Order');
const PizzaBase = require('../models/PizzaBase');
const PizzaSauce = require('../models/PizzaSauce');
const PizzaCheese = require('../models/PizzaCheese');
const PizzaVeggie = require('../models/PizzaVeggie');
const PizzaMeat = require('../models/PizzaMeat');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const { emailService } = require('../services/emailService');

/**
 * @desc    Get admin dashboard overview
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardOverview = asyncHandler(async (req, res) => {
  try {
    // Get total users (excluding admins)
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Get revenue statistics
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);
    
    // Get today's revenue
    const todaysRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: today, $lt: tomorrow }
        } 
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get low stock items
    const lowStockItems = await Promise.all([
      PizzaBase.find({ stock: { $lte: '$threshold' } }).select('name stock threshold category'),
      PizzaSauce.find({ stock: { $lte: '$threshold' } }).select('name stock threshold category'),
      PizzaCheese.find({ stock: { $lte: '$threshold' } }).select('name stock threshold category'),
      PizzaVeggie.find({ stock: { $lte: '$threshold' } }).select('name stock threshold category'),
      PizzaMeat.find({ stock: { $lte: '$threshold' } }).select('name stock threshold category')
    ]);
    
    const allLowStockItems = [
      ...lowStockItems[0].map(item => ({ ...item.toObject(), type: 'base' })),
      ...lowStockItems[1].map(item => ({ ...item.toObject(), type: 'sauce' })),
      ...lowStockItems[2].map(item => ({ ...item.toObject(), type: 'cheese' })),
      ...lowStockItems[3].map(item => ({ ...item.toObject(), type: 'veggie' })),
      ...lowStockItems[4].map(item => ({ ...item.toObject(), type: 'meat' }))
    ];
    
    // Get recent orders for activity feed
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId status totalAmount createdAt userId');
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          todaysOrders,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          todaysRevenue: todaysRevenue[0]?.revenue || 0,
          averageOrderValue: revenueStats[0]?.averageOrderValue || 0
        },
        orderStatusDistribution,
        lowStockItems: allLowStockItems,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview'
    });
  }
});

/**
 * @desc    Get inventory overview
 * @route   GET /api/admin/inventory
 * @access  Private/Admin
 */
const getInventoryOverview = asyncHandler(async (req, res) => {
  try {
    const inventory = await Promise.all([
      PizzaBase.find().select('name stock threshold category price isAvailable'),
      PizzaSauce.find().select('name stock threshold category price isAvailable'),
      PizzaCheese.find().select('name stock threshold category price isAvailable'),
      PizzaVeggie.find().select('name stock threshold category price isAvailable'),
      PizzaMeat.find().select('name stock threshold category price isAvailable')
    ]);
    
    const formattedInventory = {
      bases: inventory[0].map(item => ({ ...item.toObject(), type: 'base' })),
      sauces: inventory[1].map(item => ({ ...item.toObject(), type: 'sauce' })),
      cheeses: inventory[2].map(item => ({ ...item.toObject(), type: 'cheese' })),
      veggies: inventory[3].map(item => ({ ...item.toObject(), type: 'veggie' })),
      meats: inventory[4].map(item => ({ ...item.toObject(), type: 'meat' }))
    };
    
    // Calculate inventory statistics
    const totalItems = Object.values(formattedInventory).flat().length;
    const lowStockItems = Object.values(formattedInventory).flat()
      .filter(item => item.stock <= item.threshold).length;
    const outOfStockItems = Object.values(formattedInventory).flat()
      .filter(item => item.stock === 0).length;
    const availableItems = Object.values(formattedInventory).flat()
      .filter(item => item.isAvailable).length;
    
    res.status(200).json({
      success: true,
      data: {
        inventory: formattedInventory,
        statistics: {
          totalItems,
          lowStockItems,
          outOfStockItems,
          availableItems
        }
      }
    });
  } catch (error) {
    console.error('Inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory overview'
    });
  }
});

/**
 * @desc    Update inventory item stock
 * @route   PUT /api/admin/inventory/:type/:id
 * @access  Private/Admin
 */
const updateInventoryItem = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { type, id } = req.params;
    const { stock, threshold, price, isAvailable } = req.body;
    
    let Model;
    switch (type) {
      case 'base':
        Model = PizzaBase;
        break;
      case 'sauce':
        Model = PizzaSauce;
        break;
      case 'cheese':
        Model = PizzaCheese;
        break;
      case 'veggie':
        Model = PizzaVeggie;
        break;
      case 'meat':
        Model = PizzaMeat;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid inventory type'
        });
    }
    
    const updateData = {};
    if (stock !== undefined) updateData.stock = stock;
    if (threshold !== undefined) updateData.threshold = threshold;
    if (price !== undefined) updateData.price = price;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    
    const updatedItem = await Model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item'
    });
  }
});

/**
 * @desc    Get all orders for admin
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const filter = {};
    if (status) filter.status = status;
    
    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ [sortBy]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');
    
    const totalOrders = await Order.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page < Math.ceil(totalOrders / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:orderId/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    const order = await Order.findById(orderId).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const oldStatus = order.status;
    
    // Update order status and tracking
    order.status = status;
    if (notes) {
      order.tracking.push({
        status,
        message: notes,
        timestamp: new Date()
      });
    } else {
      order.tracking.push({
        status,
        message: `Order status updated to ${status}`,
        timestamp: new Date()
      });
    }
    
    // Set actual delivery time if delivered
    if (status === 'delivered' && oldStatus !== 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    await order.save();
    
    // Send email notification if status changed and user exists
    if (oldStatus !== status && order.userId) {
      try {
        const statusMessage = notes || `Order status updated to ${status}`;
        if (status === 'delivered') {
          await emailService.sendOrderDeliveredNotification(order, order.userId);
        } else {
          await emailService.sendOrderStatusUpdate(order, order.userId, statusMessage);
        }
        console.log(`✅ Order status email sent for order ${order.orderId}`);
      } catch (emailError) {
        console.error('⚠️ Failed to send order status email:', emailError.message);
        // Don't fail the status update if email fails
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

/**
 * @desc    Get sales analytics
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getSalesAnalytics = asyncHandler(async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    }
    
    // Daily sales data
    const salesByDay = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Popular pizza ingredients
    const popularIngredients = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $unwind: '$items.pizza.selectedIngredients.bases' },
      {
        $group: {
          _id: '$items.pizza.selectedIngredients.bases.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        salesByDay,
        popularIngredients,
        statusBreakdown,
        period
      }
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics'
    });
  }
});

module.exports = {
  getDashboardOverview,
  getInventoryOverview,
  updateInventoryItem,
  getAllOrders,
  updateOrderStatus,
  getSalesAnalytics
};