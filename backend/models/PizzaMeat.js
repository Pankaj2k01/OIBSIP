const mongoose = require('mongoose');

const pizzaMeatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meat name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Meat description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Meat price is required'],
    min: [0, 'Price cannot be negative']
  },
  type: {
    type: String,
    enum: ['Poultry', 'Pork', 'Beef', 'Seafood', 'Processed'],
    required: [true, 'Meat type is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 40
  },
  threshold: {
    type: Number,
    default: 8,
    min: [0, 'Threshold cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHalal: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['None', 'Mild', 'Medium', 'Hot'],
    default: 'None'
  },
  cookingMethod: {
    type: String,
    enum: ['Grilled', 'Smoked', 'Roasted', 'Cured', 'Fried'],
    default: 'Grilled'
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
    sodium: {
      type: Number,
      min: [0, 'Sodium cannot be negative']
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
pizzaMeatSchema.index({ name: 1 });
pizzaMeatSchema.index({ isActive: 1 });
pizzaMeatSchema.index({ type: 1 });
pizzaMeatSchema.index({ isHalal: 1 });

module.exports = mongoose.model('PizzaMeat', pizzaMeatSchema);