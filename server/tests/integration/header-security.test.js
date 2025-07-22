/**
 * Security test to verify security headers are properly configured
 */
const request = require('supertest');
const app = require('../../index');

describe('Security Headers', () => {
  test('should not expose X-Powered-By header', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  test('should include security headers from Helmet', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    // Helmet sets these security headers by default
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-download-options']).toBe('noopen');
  });

  test('should have proper content type options', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
