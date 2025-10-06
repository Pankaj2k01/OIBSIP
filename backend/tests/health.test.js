const request = require('supertest');
const app = require('../server');

describe('Backend Health Check', () => {
  test('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is running');
    expect(response.body.environment).toBeDefined();
  });

  test('should respond to root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Welcome to Pizza Ordering System API');
    expect(response.body.version).toBe('1.0.0');
  });
});