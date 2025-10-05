const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Service Class
 * Handles all email operations including notifications, order updates, and admin alerts
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initialize();
  }

  /**
   * Initialize email service with transporter
   */
  async initialize() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production configuration (use actual SMTP)
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            ciphers: 'SSLv3'
          }
        });
      } else {
        // Development configuration (use Ethereal email for testing)
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      // Verify transporter configuration
      await this.transporter.verify();
      console.log('📧 Email service initialized successfully');
      
      // Load email templates
      await this.loadTemplates();
      
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Load and compile email templates
   */
  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      
      // Ensure templates directory exists
      try {
        await fs.access(templatesDir);
      } catch {
        await fs.mkdir(templatesDir, { recursive: true });
        console.log('📁 Created email templates directory');
      }

      // Define default templates if they don't exist
      const defaultTemplates = {
        welcome: this.getWelcomeTemplate(),
        orderConfirmation: this.getOrderConfirmationTemplate(),
        orderStatusUpdate: this.getOrderStatusUpdateTemplate(),
        stockAlert: this.getStockAlertTemplate(),
        passwordReset: this.getPasswordResetTemplate(),
        orderDelivered: this.getOrderDeliveredTemplate(),
      };

      // Create template files if they don't exist and load them
      for (const [templateName, templateContent] of Object.entries(defaultTemplates)) {
        const templatePath = path.join(templatesDir, `${templateName}.hbs`);
        
        try {
          await fs.access(templatePath);
        } catch {
          // File doesn't exist, create it
          await fs.writeFile(templatePath, templateContent);
          console.log(`📧 Created template: ${templateName}.hbs`);
        }

        // Load and compile template
        const templateSource = await fs.readFile(templatePath, 'utf-8');
        this.templates.set(templateName, handlebars.compile(templateSource));
      }

      console.log(`📧 Loaded ${this.templates.size} email templates`);
      
    } catch (error) {
      console.error('❌ Failed to load email templates:', error.message);
    }
  }

  /**
   * Send email with template
   */
  async sendEmail(to, subject, templateName, data = {}, attachments = []) {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return false;
    }

    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template '${templateName}' not found`);
      }

      const html = template({
        ...data,
        currentYear: new Date().getFullYear(),
        companyName: 'Pizza Ordering System',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pizzaorder.com',
        websiteUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      });

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Pizza Order'}" <${process.env.FROM_EMAIL || 'noreply@pizzaorder.com'}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Test email sent:', nodemailer.getTestMessageUrl(result));
      }
      
      console.log(`✅ Email sent successfully to: ${to}`);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user) {
    return await this.sendEmail(
      user.email,
      '🍕 Welcome to Pizza Ordering System!',
      'welcome',
      {
        name: user.name,
        email: user.email,
        verificationLink: `${process.env.CLIENT_URL}/verify-email?token=${user.emailVerificationToken}`,
      }
    );
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order, user) {
    return await this.sendEmail(
      user.email,
      `🍕 Order Confirmation - ${order.orderId}`,
      'orderConfirmation',
      {
        userName: user.name,
        orderId: order.orderId,
        orderDate: order.createdAt.toLocaleDateString('en-IN'),
        totalAmount: order.totalAmount,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        estimatedDelivery: order.estimatedDeliveryTime || 'Within 45 minutes',
        trackingUrl: `${process.env.CLIENT_URL}/orders/${order._id}/track`,
      }
    );
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(order, user, statusMessage) {
    const statusEmojis = {
      confirmed: '✅',
      preparing: '👨‍🍳',
      baking: '🔥',
      ready: '🍕',
      'out-for-delivery': '🚚',
      delivered: '🏠',
      cancelled: '❌'
    };

    return await this.sendEmail(
      user.email,
      `${statusEmojis[order.status] || '📦'} Order Update - ${order.orderId}`,
      'orderStatusUpdate',
      {
        userName: user.name,
        orderId: order.orderId,
        status: order.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        statusMessage: statusMessage || `Your order is now ${order.status}`,
        trackingUrl: `${process.env.CLIENT_URL}/orders/${order._id}/track`,
        estimatedDelivery: order.estimatedDeliveryTime,
      }
    );
  }

  /**
   * Send stock alert to admins
   */
  async sendStockAlert(stockData, adminEmails) {
    if (!stockData.lowStockItems.length && !stockData.outOfStockItems.length) {
      return;
    }

    return await this.sendEmail(
      adminEmails,
      `🚨 Inventory Alert - ${stockData.outOfStockItems.length} Out of Stock, ${stockData.lowStockItems.length} Low Stock`,
      'stockAlert',
      {
        timestamp: new Date().toLocaleString(),
        outOfStockItems: stockData.outOfStockItems,
        lowStockItems: stockData.lowStockItems,
        dashboardUrl: `${process.env.CLIENT_URL}/admin/inventory`,
        totalCritical: stockData.outOfStockItems.length,
        totalWarning: stockData.lowStockItems.length,
      }
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    return await this.sendEmail(
      user.email,
      '🔐 Password Reset Request - Pizza Ordering System',
      'passwordReset',
      {
        name: user.name,
        resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`,
        expiryTime: '1 hour',
      }
    );
  }

  /**
   * Send order delivered notification with rating request
   */
  async sendOrderDeliveredNotification(order, user) {
    return await this.sendEmail(
      user.email,
      `🍕 Order Delivered - ${order.orderId} - How was your experience?`,
      'orderDelivered',
      {
        userName: user.name,
        orderId: order.orderId,
        deliveredAt: order.actualDeliveryTime ? 
          new Date(order.actualDeliveryTime).toLocaleString() : 
          new Date().toLocaleString(),
        ratingUrl: `${process.env.CLIENT_URL}/orders/${order._id}/track`,
        totalAmount: order.totalAmount,
      }
    );
  }

  /**
   * Send bulk notification
   */
  async sendBulkNotification(recipients, subject, templateName, data) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendEmail(recipient, subject, templateName, data);
      results.push(result);
      
      // Add small delay to avoid overwhelming the email service
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Template definitions (will be saved as .hbs files)
  getWelcomeTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ff6b35; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍕 Welcome to Pizza Ordering System!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>Welcome to our delicious world of pizzas! We're excited to have you join our community.</p>
      
      <p>To get started, please verify your email address by clicking the button below:</p>
      
      <p style="text-align: center;">
        <a href="{{verificationLink}}" class="button">Verify Email Address</a>
      </p>
      
      <p>Once verified, you can:</p>
      <ul>
        <li>🍕 Create custom pizzas with our pizza builder</li>
        <li>📱 Track your orders in real-time</li>
        <li>⭐ Save your favorite combinations</li>
        <li>🚚 Get fast delivery to your doorstep</li>
      </ul>
      
      <p>If you have any questions, our support team is here to help!</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
      <p>Need help? Contact us at {{supportEmail}}</p>
    </div>
  </div>
</body>
</html>`;
  }

  getOrderConfirmationTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .order-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍕 Order Confirmed!</h1>
    </div>
    <div class="content">
      <h2>Thank you, {{userName}}!</h2>
      <p>Your order has been confirmed and our chefs are getting ready to make your delicious pizza!</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> {{orderId}}</p>
        <p><strong>Order Date:</strong> {{orderDate}}</p>
        <p><strong>Total Amount:</strong> ₹{{totalAmount}}</p>
        <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
      </div>
      
      <div class="order-details">
        <h3>Delivery Address</h3>
        <p>{{deliveryAddress.street}}<br>
        {{deliveryAddress.city}}, {{deliveryAddress.state}} {{deliveryAddress.zipCode}}</p>
      </div>
      
      <p style="text-align: center;">
        <a href="{{trackingUrl}}" class="button">Track Your Order</a>
      </p>
      
      <p>We'll keep you updated on your order status via email and you can track your order in real-time using the link above.</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  getOrderStatusUpdateTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .status-update { background: #e9f7ff; padding: 30px; border-radius: 10px; margin: 20px 0; }
    .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Order Update</h1>
    </div>
    <div class="content">
      <h2>Hello {{userName}}!</h2>
      
      <div class="status-update">
        <h3>Order {{orderId}}</h3>
        <h2 style="color: #007bff;">{{status}}</h2>
        <p style="font-size: 18px;">{{statusMessage}}</p>
        {{#if estimatedDelivery}}
        <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        {{/if}}
      </div>
      
      <p>
        <a href="{{trackingUrl}}" class="button">View Order Details</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  getStockAlertTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .alert-section { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .critical-section { background: #f8d7da; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0; }
    .item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Inventory Alert</h1>
    </div>
    <div class="content">
      <h2>Immediate Action Required</h2>
      <p><strong>Alert Time:</strong> {{timestamp}}</p>
      
      {{#if outOfStockItems}}
      <div class="critical-section">
        <h3>🚨 OUT OF STOCK ({{totalCritical}} items)</h3>
        {{#each outOfStockItems}}
        <div class="item">
          <strong>{{name}}</strong> ({{type}} - {{category}})<br>
          <small>Stock: {{stock}} | Threshold: {{threshold}}</small>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if lowStockItems}}
      <div class="alert-section">
        <h3>⚠️ LOW STOCK ({{totalWarning}} items)</h3>
        {{#each lowStockItems}}
        <div class="item">
          <strong>{{name}}</strong> ({{type}} - {{category}})<br>
          <small>Stock: {{stock}} | Threshold: {{threshold}}</small>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="{{dashboardUrl}}" class="button">Manage Inventory</a>
      </p>
      
      <p><strong>Action Required:</strong> Please update inventory levels immediately to avoid order disruptions.</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{companyName}} - Admin Alert System</p>
    </div>
  </div>
</body>
</html>`;
  }

  getPasswordResetTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #fd7e14; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>You've requested to reset your password for your Pizza Ordering System account.</p>
      
      <p style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Reset Password</a>
      </p>
      
      <div class="warning">
        <p><strong>⚠️ Security Notice:</strong></p>
        <ul>
          <li>This link expires in {{expiryTime}}</li>
          <li>If you didn't request this reset, please ignore this email</li>
          <li>Your password won't change unless you click the link above</li>
        </ul>
      </div>
      
      <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666;">{{resetUrl}}</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  getOrderDeliveredTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .delivery-notice { background: #d4edda; padding: 30px; border-radius: 10px; margin: 20px 0; }
    .rating-section { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #ffc107; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍕 Order Delivered!</h1>
    </div>
    <div class="content">
      <h2>Thank you, {{userName}}!</h2>
      
      <div class="delivery-notice">
        <h3>✅ Order {{orderId}} Delivered</h3>
        <p><strong>Delivered at:</strong> {{deliveredAt}}</p>
        <p><strong>Total Amount:</strong> ₹{{totalAmount}}</p>
        <p style="font-size: 18px; margin-top: 20px;">We hope you enjoyed your delicious pizza! 🎉</p>
      </div>
      
      <div class="rating-section">
        <h3>⭐ How was your experience?</h3>
        <p>Your feedback helps us serve you better. Please take a moment to rate your order!</p>
        <p>
          <a href="{{ratingUrl}}" class="button">Rate Your Order</a>
        </p>
      </div>
      
      <p>Thank you for choosing our pizza! We look forward to serving you again soon.</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: !!this.transporter,
      templatesLoaded: this.templates.size,
      environment: process.env.NODE_ENV,
      emailsEnabled: !!this.transporter
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = {
  emailService,
  EmailService
};