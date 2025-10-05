const mongoose = require('mongoose');

const pizzaSauceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sauce name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Sauce description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Sauce price is required'],
    min: [0, 'Price cannot be negative']
  },
  spiceLevel: {
    type: String,
    enum: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
    default: 'Mild'
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 100
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
  ingredients: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
pizzaSauceSchema.index({ name: 1 });
pizzaSauceSchema.index({ isActive: 1 });
pizzaSauceSchema.index({ spiceLevel: 1 });

module.exports = mongoose.model('PizzaSauce', pizzaSauceSchema);