const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  baseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PizzaBase',
    required: [true, 'Pizza base is required']
  },
  sauceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PizzaSauce',
    required: [true, 'Pizza sauce is required']
  },
  cheeseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PizzaCheese',
    required: [true, 'Pizza cheese is required']
  },
  veggieIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PizzaVeggie'
  }],
  meatIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PizzaMeat'
  }],
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  itemPrice: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Price cannot be negative']
  },
  customizations: {
    size: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Extra Large'],
      default: 'Medium'
    },
    crustType: {
      type: String,
      enum: ['Thin', 'Thick', 'Stuffed'],
      default: 'Thin'
    },
    specialInstructions: {
      type: String,
      maxLength: [500, 'Special instructions cannot exceed 500 characters']
    }
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed', 
      'preparing',
      'baking',
      'ready',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required']
  },
  razorpayOrderId: {
    type: String
  },
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    }
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    }
  }],
  notes: {
    type: String,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `PZ${dateStr}${randomNum}`;
  }
  next();
});

// Pre-save middleware to add status to history
orderSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Indexes for efficient queries
orderSchema.index({ userId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);