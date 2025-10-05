const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');
const { protect, adminOnly } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware for pizza ingredients
const validateIngredient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Threshold must be a non-negative integer'),
];

// Public routes - Get ingredients for pizza builder
router.get('/ingredients', pizzaController.getAllIngredients);

// Pizza Base routes
router.get('/bases', pizzaController.base.getAll);
router.get('/bases/:id', pizzaController.base.getById);

// Admin only routes for bases
router.post('/bases', protect, adminOnly, validateIngredient, pizzaController.base.create);
router.put('/bases/:id', protect, adminOnly, validateIngredient, pizzaController.base.update);
router.delete('/bases/:id', protect, adminOnly, pizzaController.base.delete);
router.patch('/bases/:id/toggle', protect, adminOnly, pizzaController.base.toggleActive);

// Pizza Sauce routes
router.get('/sauces', pizzaController.sauce.getAll);
router.get('/sauces/:id', pizzaController.sauce.getById);

// Admin only routes for sauces
router.post('/sauces', protect, adminOnly, validateIngredient, pizzaController.sauce.create);
router.put('/sauces/:id', protect, adminOnly, validateIngredient, pizzaController.sauce.update);
router.delete('/sauces/:id', protect, adminOnly, pizzaController.sauce.delete);
router.patch('/sauces/:id/toggle', protect, adminOnly, pizzaController.sauce.toggleActive);

// Pizza Cheese routes
router.get('/cheeses', pizzaController.cheese.getAll);
router.get('/cheeses/:id', pizzaController.cheese.getById);

// Admin only routes for cheeses
router.post('/cheeses', protect, adminOnly, validateIngredient, pizzaController.cheese.create);
router.put('/cheeses/:id', protect, adminOnly, validateIngredient, pizzaController.cheese.update);
router.delete('/cheeses/:id', protect, adminOnly, pizzaController.cheese.delete);
router.patch('/cheeses/:id/toggle', protect, adminOnly, pizzaController.cheese.toggleActive);

// Pizza Veggie routes
router.get('/veggies', pizzaController.veggie.getAll);
router.get('/veggies/:id', pizzaController.veggie.getById);

// Admin only routes for veggies
router.post('/veggies', protect, adminOnly, validateIngredient, pizzaController.veggie.create);
router.put('/veggies/:id', protect, adminOnly, validateIngredient, pizzaController.veggie.update);
router.delete('/veggies/:id', protect, adminOnly, pizzaController.veggie.delete);
router.patch('/veggies/:id/toggle', protect, adminOnly, pizzaController.veggie.toggleActive);

// Pizza Meat routes
router.get('/meats', pizzaController.meat.getAll);
router.get('/meats/:id', pizzaController.meat.getById);

// Admin only routes for meats
router.post('/meats', protect, adminOnly, validateIngredient, pizzaController.meat.create);
router.put('/meats/:id', protect, adminOnly, validateIngredient, pizzaController.meat.update);
router.delete('/meats/:id', protect, adminOnly, pizzaController.meat.delete);
router.patch('/meats/:id/toggle', protect, adminOnly, pizzaController.meat.toggleActive);

// Admin routes for inventory management
router.get('/stock/low', protect, adminOnly, pizzaController.checkLowStock);

module.exports = router;