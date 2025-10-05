const { body } = require('express-validator');

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('address.street')
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.zipCode')
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^\d{5,6}$/)
    .withMessage('Please enter a valid zip code')
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Forgot password validation
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail()
];

// Reset password validation
const validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Update profile validation
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('address.street')
    .optional()
    .notEmpty()
    .withMessage('Street address cannot be empty'),
  
  body('address.city')
    .optional()
    .notEmpty()
    .withMessage('City cannot be empty'),
  
  body('address.state')
    .optional()
    .notEmpty()
    .withMessage('State cannot be empty'),
  
  body('address.zipCode')
    .optional()
    .matches(/^\d{5,6}$/)
    .withMessage('Please enter a valid zip code')
];

// Order validation
const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.baseId')
    .isMongoId()
    .withMessage('Valid base ID is required'),
  
  body('items.*.sauceId')
    .isMongoId()
    .withMessage('Valid sauce ID is required'),
  
  body('items.*.cheeseId')
    .isMongoId()
    .withMessage('Valid cheese ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  
  body('items.*.veggieIds')
    .optional()
    .isArray()
    .withMessage('Veggie IDs must be an array'),
  
  body('items.*.meatIds')
    .optional()
    .isArray()
    .withMessage('Meat IDs must be an array'),
  
  body('items.*.customizations.size')
    .isIn(['Small', 'Medium', 'Large', 'Extra Large'])
    .withMessage('Invalid size selected'),
  
  body('items.*.customizations.crustType')
    .isIn(['Thin', 'Thick', 'Stuffed'])
    .withMessage('Invalid crust type selected'),
  
  body('deliveryAddress.street')
    .notEmpty()
    .withMessage('Delivery street address is required'),
  
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('Delivery city is required'),
  
  body('deliveryAddress.state')
    .notEmpty()
    .withMessage('Delivery state is required'),
  
  body('deliveryAddress.zipCode')
    .matches(/^\d{5,6}$/)
    .withMessage('Valid delivery zip code is required')
];

// Order status validation
const validateUpdateOrderStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'baking', 'ready', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateCreateOrder,
  validateUpdateOrderStatus
};
