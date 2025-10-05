const mongoose = require('mongoose');

const pizzaBaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Base name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Base description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x300?text=Pizza+Base'
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 50
  },
  threshold: {
    type: Number,
    default: 10,
    min: [0, 'Threshold cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
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
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative']
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative']
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
pizzaBaseSchema.index({ name: 1 });
pizzaBaseSchema.index({ isActive: 1 });

module.exports = mongoose.model('PizzaBase', pizzaBaseSchema);