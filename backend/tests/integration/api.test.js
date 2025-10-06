const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const PizzaBase = require('../../models/PizzaBase');
const Order = require('../../models/Order');
const bcrypt = require('bcryptjs');

describe('Pizza Ordering System API Integration Tests', () => {
  let adminToken, userToken, adminUser, regularUser;
  let testBase, testSauce, testCheese, testVeggie, testMeat;

  beforeAll(async () => {
    // Clear test database
    await User.deleteMany({});
    await PizzaBase.deleteMany({});
    await Order.deleteMany({});

    // Create test users
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    
    adminUser = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: hashedPassword,
      phone: '9999999999',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '99999'
      },
      role: 'admin',
      isEmailVerified: true
    });

    regularUser = await User.create({
      name: 'User Test',
      email: 'user@test.com',
      password: hashedPassword,
      phone: '8888888888',
      address: {
        street: '456 User Street',
        city: 'User City',
        state: 'User State',
        zipCode: '88888'
      },
      role: 'user',
      isEmailVerified: true
    });

    // Login and get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'testpass123'
      });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'testpass123'
      });
    userToken = userLogin.body.token;

    // Create test ingredients
    testBase = await PizzaBase.create({
      name: 'Test Base',
      description: 'Test pizza base',
      price: 150,
      stock: 100,
      threshold: 10,
      isAvailable: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'newpass123',
          phone: '1234567890',
          address: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'testpass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('user@test.com');
    });

    test('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Pizza Ingredients Management', () => {
    test('should get all pizza bases', async () => {
      const response = await request(app)
        .get('/api/ingredients/bases')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('admin should be able to create new base', async () => {
      const response = await request(app)
        .post('/api/ingredients/bases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Test Base',
          description: 'A new test base',
          price: 200,
          stock: 50,
          threshold: 5,
          isAvailable: true
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('New Test Base');
    });

    test('regular user should not be able to create base', async () => {
      const response = await request(app)
        .post('/api/ingredients/bases')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Base',
          description: 'Should not work',
          price: 200,
          stock: 50,
          threshold: 5
        });

      expect(response.status).toBe(403);
    });

    test('admin should be able to update base stock', async () => {
      const response = await request(app)
        .patch(`/api/ingredients/bases/${testBase._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          stock: 75
        });

      expect(response.status).toBe(200);
      expect(response.body.data.stock).toBe(75);
    });
  });

  describe('Order Management', () => {
    let testOrder;

    test('should create a new order', async () => {
      const orderData = {
        items: [{
          base: testBase._id,
          quantity: 2,
          customizations: {
            size: 'large'
          }
        }],
        customerInfo: {
          name: 'Test Customer',
          email: 'customer@test.com',
          phone: '1234567890',
          address: {
            street: '123 Test St',
            city: 'Test City',
            zipCode: '12345'
          }
        },
        paymentMethod: 'cash'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.items).toHaveLength(1);
      testOrder = response.body.data;
    });

    test('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('admin should be able to update order status', async () => {
      const response = await request(app)
        .patch(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'confirmed'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('confirmed');
    });

    test('should get order by tracking number', async () => {
      const response = await request(app)
        .get(`/api/orders/track/${testOrder.trackingNumber}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trackingNumber).toBe(testOrder.trackingNumber);
    });
  });

  describe('Inventory Management', () => {
    test('admin should get low stock alerts', async () => {
      // First reduce stock below threshold
      await PizzaBase.findByIdAndUpdate(testBase._id, { stock: 5 });

      const response = await request(app)
        .get('/api/inventory/low-stock')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get inventory summary', async () => {
      const response = await request(app)
        .get('/api/inventory/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalCategories).toBeDefined();
    });
  });

  describe('Analytics', () => {
    test('admin should get order analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.data.totalOrders).toBeDefined();
    });

    test('admin should get revenue analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          period: 'month'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.totalRevenue).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    test('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/admin/users');

      expect(response.status).toBe(401);
    });

    test('should handle invalid object IDs', async () => {
      const response = await request(app)
        .get('/api/ingredients/bases/invalid-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
    });
  });
});