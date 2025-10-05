const PizzaBase = require('../models/PizzaBase');
const PizzaSauce = require('../models/PizzaSauce');
const PizzaCheese = require('../models/PizzaCheese');
const PizzaVeggie = require('../models/PizzaVeggie');
const PizzaMeat = require('../models/PizzaMeat');
const { validationResult } = require('express-validator');

// Generic CRUD operations for all pizza ingredients
const createGenericController = (Model, itemName) => ({
  // Get all items
  getAll: async (req, res) => {
    try {
      const { isActive = true } = req.query;
      const query = isActive !== 'all' ? { isActive } : {};
      
      const items = await Model.find(query).sort({ name: 1 });
      
      res.status(200).json({
        success: true,
        data: {
          [itemName]: items,
          count: items.length
        }
      });
    } catch (error) {
      console.error(`Get all ${itemName} error:`, error);
      res.status(500).json({
        success: false,
        message: `Server error getting ${itemName}`
      });
    }
  },

  // Get item by ID
  getById: async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${itemName} not found`
        });
      }

      res.status(200).json({
        success: true,
        data: {
          [itemName.slice(0, -1)]: item
        }
      });
    } catch (error) {
      console.error(`Get ${itemName} by ID error:`, error);
      res.status(500).json({
        success: false,
        message: `Server error getting ${itemName}`
      });
    }
  },

  // Create new item (Admin only)
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const item = await Model.create(req.body);

      res.status(201).json({
        success: true,
        message: `${itemName.slice(0, -1)} created successfully`,
        data: {
          [itemName.slice(0, -1)]: item
        }
      });
    } catch (error) {
      console.error(`Create ${itemName} error:`, error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: `${itemName.slice(0, -1)} with this name already exists`
        });
      } else {
        res.status(500).json({
          success: false,
          message: `Server error creating ${itemName}`
        });
      }
    }
  },

  // Update item (Admin only)
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${itemName.slice(0, -1)} not found`
        });
      }

      res.status(200).json({
        success: true,
        message: `${itemName.slice(0, -1)} updated successfully`,
        data: {
          [itemName.slice(0, -1)]: item
        }
      });
    } catch (error) {
      console.error(`Update ${itemName} error:`, error);
      res.status(500).json({
        success: false,
        message: `Server error updating ${itemName}`
      });
    }
  },

  // Delete item (Admin only)
  delete: async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${itemName.slice(0, -1)} not found`
        });
      }

      res.status(200).json({
        success: true,
        message: `${itemName.slice(0, -1)} deleted successfully`
      });
    } catch (error) {
      console.error(`Delete ${itemName} error:`, error);
      res.status(500).json({
        success: false,
        message: `Server error deleting ${itemName}`
      });
    }
  },

  // Toggle active status (Admin only)
  toggleActive: async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${itemName.slice(0, -1)} not found`
        });
      }

      item.isActive = !item.isActive;
      await item.save();

      res.status(200).json({
        success: true,
        message: `${itemName.slice(0, -1)} ${item.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          [itemName.slice(0, -1)]: item
        }
      });
    } catch (error) {
      console.error(`Toggle ${itemName} active error:`, error);
      res.status(500).json({
        success: false,
        message: `Server error updating ${itemName}`
      });
    }
  }
});

// Create controllers for each pizza ingredient
const baseController = createGenericController(PizzaBase, 'bases');
const sauceController = createGenericController(PizzaSauce, 'sauces');
const cheeseController = createGenericController(PizzaCheese, 'cheeses');
const veggieController = createGenericController(PizzaVeggie, 'veggies');
const meatController = createGenericController(PizzaMeat, 'meats');

// Get all pizza ingredients (for pizza builder)
const getAllIngredients = async (req, res) => {
  try {
    const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
      PizzaBase.find({ isActive: true }).sort({ name: 1 }),
      PizzaSauce.find({ isActive: true }).sort({ name: 1 }),
      PizzaCheese.find({ isActive: true }).sort({ name: 1 }),
      PizzaVeggie.find({ isActive: true }).sort({ name: 1 }),
      PizzaMeat.find({ isActive: true }).sort({ name: 1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        bases,
        sauces,
        cheeses,
        veggies,
        meats
      }
    });
  } catch (error) {
    console.error('Get all ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting ingredients'
    });
  }
};

// Check stock levels for low inventory alert
const checkLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || process.env.STOCK_THRESHOLD || 20;
    
    const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
      PizzaBase.find({ stock: { $lte: threshold }, isActive: true }),
      PizzaSauce.find({ stock: { $lte: threshold }, isActive: true }),
      PizzaCheese.find({ stock: { $lte: threshold }, isActive: true }),
      PizzaVeggie.find({ stock: { $lte: threshold }, isActive: true }),
      PizzaMeat.find({ stock: { $lte: threshold }, isActive: true })
    ]);

    const lowStockItems = [
      ...bases.map(item => ({ ...item.toObject(), type: 'base' })),
      ...sauces.map(item => ({ ...item.toObject(), type: 'sauce' })),
      ...cheeses.map(item => ({ ...item.toObject(), type: 'cheese' })),
      ...veggies.map(item => ({ ...item.toObject(), type: 'veggie' })),
      ...meats.map(item => ({ ...item.toObject(), type: 'meat' }))
    ];

    res.status(200).json({
      success: true,
      data: {
        lowStockItems,
        count: lowStockItems.length,
        threshold
      }
    });
  } catch (error) {
    console.error('Check low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking stock levels'
    });
  }
};

module.exports = {
  base: baseController,
  sauce: sauceController,
  cheese: cheeseController,
  veggie: veggieController,
  meat: meatController,
  getAllIngredients,
  checkLowStock
};