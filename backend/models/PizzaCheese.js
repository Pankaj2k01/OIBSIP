const mongoose = require('mongoose');

const pizzaCheeseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cheese name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Cheese description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Cheese price is required'],
    min: [0, 'Price cannot be negative']
  },
  type: {
    type: String,
    enum: ['Fresh', 'Aged', 'Processed', 'Organic'],
    default: 'Fresh'
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 75
  },
  threshold: {
    type: Number,
    default: 12,
    min: [0, 'Threshold cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  origin: {
    type: String,
    trim: true
  },
  nutritionalInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative']
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative']
    },
    calcium: {
      type: Number,
      min: [0, 'Calcium cannot be negative']
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
pizzaCheeseSchema.index({ name: 1 });
pizzaCheeseSchema.index({ isActive: 1 });
pizzaCheeseSchema.index({ type: 1 });

module.exports = mongoose.model('PizzaCheese', pizzaCheeseSchema);