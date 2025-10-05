const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Validate Razorpay configuration
const validateRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  Razorpay configuration is missing. Payment features will be disabled.');
    return false;
  }
  console.log('✅ Razorpay configured successfully');
  return true;
};

module.exports = {
  razorpay,
  validateRazorpayConfig
};