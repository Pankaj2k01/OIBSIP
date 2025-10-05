const Razorpay = require('razorpay');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

/**
 * Middleware to validate Razorpay configuration on startup
 */
const razorpayValidation = (req, res, next) => {
  try {
    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    // Test Razorpay instance creation
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Attach razorpay instance to request
    req.razorpay = razorpay;
    next();
  } catch (error) {
    console.error('❌ Razorpay validation failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Payment service initialization failed'
    });
  }
};

/**
 * Middleware to verify Razorpay webhook signature
 */
const verifyRazorpaySignature = (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay signature'
      });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid Razorpay webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Signature verification failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Signature verification failed'
    });
  }
};

/**
 * Rate limiting for payment operations
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Validate Razorpay payment ID format
 */
const validatePaymentId = (req, res, next) => {
  const { paymentId } = req.body;
  
  if (paymentId && !/^pay_[A-Za-z0-9]{14}$/.test(paymentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment ID format'
    });
  }
  
  next();
};

/**
 * Validate Razorpay order ID format
 */
const validateOrderId = (req, res, next) => {
  const { orderId } = req.body;
  
  if (orderId && !/^order_[A-Za-z0-9]{14}$/.test(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format'
    });
  }
  
  next();
};

module.exports = {
  razorpayValidation,
  verifyRazorpaySignature,
  paymentLimiter,
  validatePaymentId,
  validateOrderId
};