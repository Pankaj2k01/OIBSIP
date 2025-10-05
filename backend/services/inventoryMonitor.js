const PizzaBase = require('../models/PizzaBase');
const PizzaSauce = require('../models/PizzaSauce');
const PizzaCheese = require('../models/PizzaCheese');
const PizzaVeggie = require('../models/PizzaVeggie');
const PizzaMeat = require('../models/PizzaMeat');
const User = require('../models/User');
const cron = require('node-cron');
const { emailService } = require('./emailService');

/**
 * Inventory Monitoring Service
 * Monitors stock levels and sends notifications when items fall below threshold
 */
class InventoryMonitor {
  constructor() {
    this.models = [
      { model: PizzaBase, type: 'Pizza Base' },
      { model: PizzaSauce, type: 'Pizza Sauce' },
      { model: PizzaCheese, type: 'Pizza Cheese' },
      { model: PizzaVeggie, type: 'Pizza Veggie' },
      { model: PizzaMeat, type: 'Pizza Meat' }
    ];
    
    this.isMonitoring = false;
    this.lastCheck = null;
    this.checkInterval = '*/30 * * * *'; // Every 30 minutes
  }

  /**
   * Start inventory monitoring
   */
  start() {
    if (this.isMonitoring) {
      console.log('📦 Inventory monitor is already running');
      return;
    }

    console.log('🚀 Starting inventory monitoring service...');
    
    // Run initial check
    this.checkInventory();
    
    // Schedule periodic checks
    this.cronJob = cron.schedule(this.checkInterval, () => {
      this.checkInventory();
    }, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });

    this.isMonitoring = true;
    console.log(`✅ Inventory monitor started - checking every 30 minutes`);
  }

  /**
   * Stop inventory monitoring
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isMonitoring = false;
      console.log('🛑 Inventory monitoring stopped');
    }
  }

  /**
   * Check inventory levels for all items
   */
  async checkInventory() {
    try {
      console.log('📊 Running inventory check...');
      this.lastCheck = new Date();
      
      const lowStockItems = [];
      const outOfStockItems = [];
      
      for (const { model, type } of this.models) {
        try {
          // Find items below threshold
          const lowStock = await model.find({
            $expr: { $lte: ['$stock', '$threshold'] },
            stock: { $gt: 0 } // Not completely out of stock
          }).select('name stock threshold category price');

          // Find out-of-stock items
          const outOfStock = await model.find({
            stock: 0
          }).select('name stock threshold category price');

          // Add type information
          lowStock.forEach(item => {
            lowStockItems.push({
              ...item.toObject(),
              type,
              status: 'low_stock'
            });
          });

          outOfStock.forEach(item => {
            outOfStockItems.push({
              ...item.toObject(),
              type,
              status: 'out_of_stock'
            });
          });

        } catch (modelError) {
          console.error(`❌ Error checking ${type}:`, modelError.message);
        }
      }

      // Log findings
      if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
        console.log(`⚠️  Found ${lowStockItems.length} low stock items and ${outOfStockItems.length} out-of-stock items`);
        
        // Send notifications if items need attention
        await this.sendStockNotifications(lowStockItems, outOfStockItems);
      } else {
        console.log('✅ All inventory items are well-stocked');
      }

      // Update availability status for out-of-stock items
      await this.updateAvailabilityStatus(outOfStockItems);

      return {
        success: true,
        timestamp: this.lastCheck,
        lowStockItems,
        outOfStockItems,
        summary: {
          totalLowStock: lowStockItems.length,
          totalOutOfStock: outOfStockItems.length
        }
      };

    } catch (error) {
      console.error('❌ Inventory check failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Send stock notifications to admin users
   */
  async sendStockNotifications(lowStockItems, outOfStockItems) {
    try {
      if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
        return;
      }

      // Get all admin users
      const adminUsers = await User.find({ role: 'admin' }).select('email name');
      
      if (adminUsers.length === 0) {
        console.log('⚠️  No admin users found for stock notifications');
        return;
      }

      const adminEmails = adminUsers.map(user => user.email);
      const stockData = {
        lowStockItems,
        outOfStockItems,
        timestamp: new Date().toLocaleString()
      };
      
      console.log('📧 Sending stock alert emails to:', {
        recipients: adminEmails.length,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length
      });

      // Send email notifications using email service
      const emailResult = await emailService.sendStockAlert(stockData, adminEmails);
      
      if (emailResult) {
        console.log('✅ Stock alert emails sent successfully');
      } else {
        console.log('⚠️  Email service not available, logging notification instead');
        const notification = this.generateStockNotification(lowStockItems, outOfStockItems);
        console.log('📬 Stock Alert Notification:', notification);
      }

      return {
        emailsSent: !!emailResult,
        recipients: adminEmails.length,
        stockData
      };

    } catch (error) {
      console.error('❌ Failed to send stock notifications:', error.message);
      
      // Fallback to console logging
      const notification = this.generateStockNotification(lowStockItems, outOfStockItems);
      console.log('📬 Fallback Stock Alert:', notification);
    }
  }

  /**
   * Generate stock notification message
   */
  generateStockNotification(lowStockItems, outOfStockItems) {
    const timestamp = new Date().toLocaleString();
    
    let message = `🍕 Pizza Ordering System - Inventory Alert\n`;
    message += `Time: ${timestamp}\n\n`;

    if (outOfStockItems.length > 0) {
      message += `🚨 OUT OF STOCK ITEMS (${outOfStockItems.length}):\n`;
      message += `${'='.repeat(40)}\n`;
      
      outOfStockItems.forEach(item => {
        message += `• ${item.type}: ${item.name} (${item.category})\n`;
        message += `  Stock: ${item.stock} | Threshold: ${item.threshold}\n\n`;
      });
    }

    if (lowStockItems.length > 0) {
      message += `⚠️  LOW STOCK ITEMS (${lowStockItems.length}):\n`;
      message += `${'='.repeat(40)}\n`;
      
      lowStockItems.forEach(item => {
        message += `• ${item.type}: ${item.name} (${item.category})\n`;
        message += `  Stock: ${item.stock} | Threshold: ${item.threshold}\n\n`;
      });
    }

    message += `\n🔧 Please update inventory levels in the admin dashboard.`;
    message += `\n🌐 Admin Dashboard: ${process.env.CLIENT_URL || 'http://localhost:3000'}/admin`;

    return {
      subject: `🍕 Inventory Alert - ${outOfStockItems.length} Out of Stock, ${lowStockItems.length} Low Stock`,
      message,
      priority: outOfStockItems.length > 0 ? 'high' : 'medium',
      categories: ['inventory', 'stock-alert']
    };
  }

  /**
   * Update availability status for out-of-stock items
   */
  async updateAvailabilityStatus(outOfStockItems) {
    try {
      const updatePromises = [];

      for (const item of outOfStockItems) {
        const model = this.getModelByType(item.type);
        if (model && item.isAvailable) {
          updatePromises.push(
            model.findByIdAndUpdate(item._id, { isAvailable: false })
          );
        }
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(`🔄 Updated availability status for ${updatePromises.length} out-of-stock items`);
      }

    } catch (error) {
      console.error('❌ Failed to update availability status:', error.message);
    }
  }

  /**
   * Get model by item type
   */
  getModelByType(type) {
    const modelMap = {
      'Pizza Base': PizzaBase,
      'Pizza Sauce': PizzaSauce,
      'Pizza Cheese': PizzaCheese,
      'Pizza Veggie': PizzaVeggie,
      'Pizza Meat': PizzaMeat
    };
    
    return modelMap[type];
  }

  /**
   * Get current monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      lastCheck: this.lastCheck,
      checkInterval: this.checkInterval,
      nextCheck: this.cronJob && this.isMonitoring 
        ? 'Within 30 minutes' 
        : 'Not scheduled'
    };
  }

  /**
   * Manual inventory check (for testing or admin trigger)
   */
  async manualCheck() {
    console.log('🔍 Manual inventory check initiated...');
    return await this.checkInventory();
  }

  /**
   * Update stock for a specific item
   */
  async updateItemStock(type, itemId, newStock) {
    try {
      const model = this.getModelByType(type);
      if (!model) {
        throw new Error('Invalid item type');
      }

      const item = await model.findByIdAndUpdate(
        itemId, 
        { 
          stock: newStock,
          isAvailable: newStock > 0
        }, 
        { new: true }
      );

      if (!item) {
        throw new Error('Item not found');
      }

      console.log(`📦 Updated stock for ${type}: ${item.name} to ${newStock}`);
      
      // Run immediate check if stock is low
      if (newStock <= item.threshold) {
        console.log('⚠️  Stock is below threshold, running immediate check...');
        await this.checkInventory();
      }

      return item;

    } catch (error) {
      console.error('❌ Failed to update item stock:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const inventoryMonitor = new InventoryMonitor();

module.exports = {
  inventoryMonitor,
  InventoryMonitor
};