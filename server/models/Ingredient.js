const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  type: { type: String, enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'], required: true },
  name: { type: String, required: true },
  stock: { type: Number, default: 100 },
  threshold: { type: Number, default: 20 },
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);
