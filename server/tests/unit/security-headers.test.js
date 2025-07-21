const request = require('supertest');
const app = require('../../index');

describe('Security Headers', () => {
  describe('X-Powered-By Header', () => {
    test('should not expose X-Powered-By header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    test('should not expose X-Powered-By header on error responses', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Helmet Security Headers', () => {
    test('should include X-Content-Type-Options header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should include X-Frame-Options header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    test('should include X-Download-Options header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-download-options']).toBe('noopen');
    });

    test('should include Referrer-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['referrer-policy']).toBe('no-referrer');
    });

    test('should set X-XSS-Protection header to 0 (recommended)', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet sets this to "0" to disable the legacy XSS filter
      expect(response.headers['x-xss-protection']).toBe('0');
    });
  });

  describe('Application Functionality', () => {
    test('should not break health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
