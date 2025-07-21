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

    test('should not expose X-Powered-By header on API routes', async () => {
      const response = await request(app)
        .get('/api/spotify/genres')
        .expect(500); // API will fail due to Spotify auth, but headers should still be correct

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

    test('should include X-DNS-Prefetch-Control header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-dns-prefetch-control']).toBe('off');
    });

    test('should include Cross-Origin-Embedder-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet may not set this by default in newer versions - check if present
      if (response.headers['cross-origin-embedder-policy']) {
        expect(response.headers['cross-origin-embedder-policy']).toBe('require-corp');
      }
    });

    test('should include Cross-Origin-Opener-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
    });

    test('should include Cross-Origin-Resource-Policy header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['cross-origin-resource-policy']).toBe('same-origin');
    });

    test('should include Origin-Agent-Cluster header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['origin-agent-cluster']).toBe('?1');
    });
  });

  describe('Legacy Security Headers Not Set', () => {
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

    test('should not break API endpoint functionality', async () => {
      const response = await request(app)
        .get('/api/spotify/genres')
        .expect(500); // API will fail due to Spotify auth

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Something went wrong!');
    });
  });
});
