const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ name: String, price: Number, image: String, base: String, sauce: String, cheese: String, veggies: [String], meat: [String] }],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Order Received' },
  paymentId: String,
  customerDetails: { name: String, address: String, mobile: String },
}, { timestamps: true });


module.exports = mongoose.model('Order', orderSchema);
