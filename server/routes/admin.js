const express = require('express');
const Ingredient = require('../models/Ingredient');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get inventory
router.get('/inventory', auth, adminAuth, async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.send(ingredients);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Update inventory
router.put('/inventory/:id', auth, adminAuth, async (req, res) => {
  try {
    const { stock } = req.body;
    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.send(ingredient);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Get orders
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'email');
    res.send(orders);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Update order status
router.put('/orders/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.send(order);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// Update order payment ID
router.put('/order/:id/payment', auth, adminAuth, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentId }, { new: true });
    res.send(order);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

module.exports = router;
