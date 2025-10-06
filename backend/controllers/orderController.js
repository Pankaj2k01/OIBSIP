const Order = require('../models/Order');
const PizzaBase = require('../models/PizzaBase');
const PizzaSauce = require('../models/PizzaSauce');
const PizzaCheese = require('../models/PizzaCheese');
const PizzaVeggie = require('../models/PizzaVeggie');
const PizzaMeat = require('../models/PizzaMeat');
const User = require('../models/User');
const { razorpay } = require('../config/razorpay');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { emailService } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');

// Size multipliers (should match frontend)
const SIZE_MULTIPLIERS = {
  'Small': 0.8,
  'Medium': 1.0,
  'Large': 1.3,
  'Extra Large': 1.6
};

// Create Razorpay order
const createPaymentOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, deliveryAddress } = req.body;
    
    // Validate and calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Fetch and validate ingredients
      const [base, sauce, cheese, veggies, meats] = await Promise.all([
        PizzaBase.findById(item.baseId),
        PizzaSauce.findById(item.sauceId),
        PizzaCheese.findById(item.cheeseId),
        PizzaVeggie.find({ _id: { $in: item.veggieIds || [] } }),
        PizzaMeat.find({ _id: { $in: item.meatIds || [] } })
      ]);

      if (!base || !sauce || !cheese) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pizza ingredients selected'
        });
      }

      // Check stock availability
      if (base.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${base.name}. Available: ${base.stock}`
        });
      }

      // Calculate item price
      let itemBasePrice = base.price + sauce.price + cheese.price;
      itemBasePrice += veggies.reduce((sum, veggie) => sum + veggie.price, 0);
      itemBasePrice += meats.reduce((sum, meat) => sum + meat.price, 0);

      // Apply size multiplier
      const sizeMultiplier = SIZE_MULTIPLIERS[item.customizations?.size || 'Medium'];
      const itemPrice = itemBasePrice * sizeMultiplier * item.quantity;

      orderItems.push({
        baseId: item.baseId,
        sauceId: item.sauceId,
        cheeseId: item.cheeseId,
        veggieIds: item.veggieIds || [],
        meatIds: item.meatIds || [],
        quantity: item.quantity,
        itemPrice: itemPrice,
        customizations: item.customizations || {
          size: 'Medium',
          crustType: 'Thin',
          specialInstructions: ''
        }
      });

      totalAmount += itemPrice;
    }

    // Round to 2 decimal places and convert to paisa (Razorpay uses paisa)
    const amountInPaisa = Math.round(totalAmount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaisa,
      currency: 'INR',
      receipt: `order_${Date.now()}_${req.user._id}`,
      notes: {
        userId: req.user._id.toString(),
        itemCount: items.length
      }
    });

    // Create order in database
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount: totalAmount,
      paymentId: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      deliveryAddress,
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
    });

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaisa,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment order'
    });
  }
};

// Verify payment and update order
const verifyPaymentAndPlaceOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Find and update order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    order.paymentId = razorpay_payment_id;
    await order.save();

    // Update ingredient stock
    for (const item of order.items) {
      await Promise.all([
        PizzaBase.findByIdAndUpdate(item.baseId, { $inc: { stock: -item.quantity } }),
        PizzaSauce.findByIdAndUpdate(item.sauceId, { $inc: { stock: -item.quantity } }),
        PizzaCheese.findByIdAndUpdate(item.cheeseId, { $inc: { stock: -item.quantity } })
      ]);

      // Update veggie stock
      for (const veggieId of item.veggieIds) {
        await PizzaVeggie.findByIdAndUpdate(veggieId, { $inc: { stock: -item.quantity } });
      }

      // Update meat stock
      for (const meatId of item.meatIds) {
        await PizzaMeat.findByIdAndUpdate(meatId, { $inc: { stock: -item.quantity } });
      }
    }

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email phone')
      .populate('items.baseId items.sauceId items.cheeseId items.veggieIds items.meatIds');

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(populatedOrder, populatedOrder.userId);
      console.log('✅ Order confirmation email sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send order confirmation email:', emailError.message);
      // Don't fail the order process if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.baseId items.sauceId items.cheeseId items.veggieIds items.meatIds')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    })
    .populate('items.baseId items.sauceId items.cheeseId items.veggieIds items.meatIds');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
};


// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.baseId items.sauceId items.cheeseId items.veggieIds items.meatIds')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    // Get order statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalOrders: total,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;
    order.status = status;
    
    // Add note to status history
    if (note) {
      order.statusHistory.push({
        status,
        note,
        timestamp: new Date()
      });
    }

    // Set delivery time when delivered
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${status}`,
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
};

/**
 * @desc    Get user's orders with pagination and filtering
 * @route   GET /api/orders/user
 * @access  Private
 */
const getUserOrdersWithPagination = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    
    const orders = await Order.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('orderId status totalAmount createdAt items')
      .lean();
    
    // Add items count to each order
    const ordersWithCount = orders.map(order => ({
      ...order,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));
    
    const totalOrders = await Order.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithCount,
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
    console.error('Get user orders with pagination error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders'
    });
  }
});

/**
 * @desc    Cancel order (user)
 * @route   PUT /api/orders/:orderId/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.tracking.push({
      status: 'cancelled',
      message: reason || 'Order cancelled by customer',
      timestamp: new Date()
    });
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

/**
 * @desc    Request refund for order
 * @route   POST /api/orders/:orderId/refund
 * @access  Private
 */
const requestRefund = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if refund can be requested
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Refund can only be requested for paid orders'
      });
    }
    
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot request refund for delivered orders'
      });
    }
    
    // Add refund request to order
    order.refundRequested = true;
    order.refundReason = reason;
    order.refundRequestedAt = new Date();
    
    order.tracking.push({
      status: order.status,
      message: 'Refund requested by customer',
      timestamp: new Date()
    });
    
    await order.save();
    
    // TODO: Integrate with Razorpay refund API
    console.log(`Refund requested for order ${order.orderId}: ${reason}`);
    
    res.status(200).json({
      success: true,
      message: 'Refund request submitted successfully. We will process it within 3-5 business days.'
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request refund'
    });
  }
});

/**
 * @desc    Rate and review order
 * @route   POST /api/orders/:orderId/rate
 * @access  Private
 */
const rateOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered to submit a rating'
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Update order with rating
    order.rating = rating;
    order.review = review;
    order.ratedAt = new Date();
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

module.exports = {
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
};
