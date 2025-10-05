const mongoose = require('mongoose');

const pizzaVeggieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veggie name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Veggie description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Veggie price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    enum: ['Leafy Greens', 'Root Vegetables', 'Peppers', 'Onions', 'Mushrooms', 'Tomatoes', 'Other'],
    default: 'Other'
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 60
  },
  threshold: {
    type: Number,
    default: 15,
    min: [0, 'Threshold cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  seasonality: {
    type: [String],
    enum: ['Spring', 'Summer', 'Fall', 'Winter', 'Year-round'],
    default: ['Year-round']
  },
  nutritionalInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative']
    },
    vitamins: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Index for efficient queries
pizzaVeggieSchema.index({ name: 1 });
pizzaVeggieSchema.index({ isActive: 1 });
pizzaVeggieSchema.index({ category: 1 });
pizzaVeggieSchema.index({ isOrganic: 1 });

module.exports = mongoose.model('PizzaVeggie', pizzaVeggieSchema);