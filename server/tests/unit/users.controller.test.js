const request = require('supertest');
const express = require('express');
const UsersController = require('../../src/controllers/users.controller');

const app = express();
app.use(express.json());
app.post('/api/users/profile', UsersController.updateProfile);

describe('UsersController', () => {
  describe('updateProfile', () => {
    it('should sanitize HTML in user inputs and return safe HTML', async () => {
      const maliciousPayload = {
        name: '<script>alert("XSS")</script>John',
        email: '<img src=x onerror=alert("XSS")>john@example.com',
        bio: 'I love <script>alert("XSS")</script> programming <b>bold text</b>'
      };

      const response = await request(app)
        .post('/api/users/profile')
        .send(maliciousPayload)
        .expect(200);

      // Verify Content-Security-Policy header is set
      expect(response.headers['content-security-policy']).toBe(
        "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'none';"
      );

      // Verify dangerous script tags are escaped/removed
      expect(response.text).not.toContain('<script>');
      expect(response.text).not.toContain('<img src=x onerror=');
      expect(response.text).not.toContain('alert("XSS")');
      
      // Verify safe content is preserved (HTML escaped in name/email)
      expect(response.text).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;John');
      expect(response.text).toContain('&lt;img src=x onerror=alert(&quot;XSS&quot;)&gt;john@example.com');
      expect(response.text).toContain('<b>bold text</b>'); // Safe HTML tags allowed in bio
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/users/profile')
        .send({ name: 'John' })
        .expect(400);

      expect(response.body.error).toBe('Name, bio, and email are required');
    });

    it('should handle normal user input correctly', async () => {
      const normalPayload = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'I am a <strong>software developer</strong> who loves coding.'
      };

      const response = await request(app)
        .post('/api/users/profile')
        .send(normalPayload)
        .expect(200);

      expect(response.text).toContain('John Doe');
      expect(response.text).toContain('john@example.com');
      expect(response.text).toContain('<strong>software developer</strong>');
    });
  });
});
