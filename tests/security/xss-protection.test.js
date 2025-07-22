/**
 * Security test to verify XSS protection in users controller
 */
const request = require('supertest');
const app = require('../../index');

describe('XSS Protection', () => {
  test('should escape HTML in user input to prevent XSS', async () => {
    const maliciousInput = {
      name: '<script>alert("XSS")</script>',
      bio: '<img src=x onerror=alert("XSS")>',
      email: 'test@example.com'
    };

    const response = await request(app)
      .put('/api/users/profile')
      .send(maliciousInput)
      .expect(200);

    // Verify that script tags are escaped
    expect(response.text).not.toContain('<script>');
    expect(response.text).not.toContain('onerror=');
    expect(response.text).toContain('&lt;script&gt;');
    expect(response.text).toContain('&lt;img src=x onerror=alert("XSS")&gt;');
  });

  test('should include Content-Security-Policy header', async () => {
    const validInput = {
      name: 'John Doe',
      bio: 'Software Developer',
      email: 'john@example.com'
    };

    const response = await request(app)
      .put('/api/users/profile')
      .send(validInput)
      .expect(200);

    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
  });
});
