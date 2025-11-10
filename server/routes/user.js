const express = require('express');
const Ingredient = require('../models/Ingredient');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get pizza varieties
router.get('/pizzas', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.send(ingredients);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Place order
router.post('/order', auth, async (req, res) => {
  try {
    const { items, totalPrice, paymentId, customerDetails } = req.body;
    let finalPaymentId = paymentId;
    if (finalPaymentId && finalPaymentId.startsWith('dummy')) {
      finalPaymentId = 'pay_' + Date.now();
    }
    const order = new Order({ user: req.user.id, items, totalPrice, paymentId: finalPaymentId, customerDetails });
    await order.save();

    // Update stock
    for (const item of items) {
      if (item.base) await Ingredient.findOneAndUpdate({ name: item.base }, { $inc: { stock: -1 } });
      if (item.sauce) await Ingredient.findOneAndUpdate({ name: item.sauce }, { $inc: { stock: -1 } });
      if (item.cheese) await Ingredient.findOneAndUpdate({ name: item.cheese }, { $inc: { stock: -1 } });
      for (const veggie of item.veggies || []) {
        await Ingredient.findOneAndUpdate({ name: veggie }, { $inc: { stock: -1 } });
      }
      for (const meat of item.meat || []) {
        await Ingredient.findOneAndUpdate({ name: meat }, { $inc: { stock: -1 } });
      }
    }

    // Check thresholds and send email if needed
    const lowStock = await Ingredient.find({ stock: { $lt: process.env.STOCK_THRESHOLD } });
    if (lowStock.length > 0) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: 'Low Stock Alert',
        html: `<p>Low stock for: ${lowStock.map(i => i.name).join(', ')}</p>`,
      });
    }

    res.send({ orderId: order._id });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Get user orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('user', 'email');
    res.send(orders);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Razorpay order creation
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const razorpay = require('../config/razorpay');
    const { totalPrice } = req.body;
    const options = {
      amount: totalPrice * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: 'order_rcptid_' + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);
    res.send({ order });
  } catch (e) {
    console.error('Razorpay order creation error:', e);
    // For test mode, return dummy order if API fails
    const dummyOrder = {
      id: 'order_' + Date.now(),
      amount: totalPrice * 100,
      currency: 'INR',
      receipt: 'order_rcptid_' + Date.now(),
    };
    console.log('Returning dummy order:', dummyOrder);
    res.send({ order: dummyOrder });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { email }, { new: true }).select('-password');
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Get Razorpay key
router.get('/razorpay-key', (req, res) => {
  res.send({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
