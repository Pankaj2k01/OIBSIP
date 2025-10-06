const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring and deployment
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'Pizza Ordering System Backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.database = {
        status: 'connected',
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    } else {
      healthCheck.database = {
        status: 'disconnected'
      };
      healthCheck.status = 'WARNING';
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    healthCheck.memory = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    };

    // Check if critical services are available
    healthCheck.services = {
      emailService: process.env.SMTP_HOST ? 'configured' : 'not configured',
      paymentService: process.env.RAZORPAY_KEY_ID ? 'configured' : 'not configured'
    };

    res.status(200).json(healthCheck);

  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe for Kubernetes or container orchestration
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const isDBReady = mongoose.connection.readyState === 1;
    
    if (isDBReady) {
      res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'NOT_READY',
        reason: 'Database not connected',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe for Kubernetes or container orchestration
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;