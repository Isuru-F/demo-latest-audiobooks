const request = require('supertest');
const app = require('../../index');

describe('Security Headers', () => {
  describe('X-Powered-By Header', () => {
    it('should not expose X-Powered-By header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Verify X-Powered-By header is not present
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should include security headers from Helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Verify Helmet security headers are present
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });
});
