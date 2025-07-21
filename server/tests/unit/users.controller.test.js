const request = require('supertest');
const express = require('express');
const usersController = require('../../src/controllers/users.controller');

const app = express();
app.use(express.json());
app.post('/api/users/profile', usersController.updateProfile);

// Error handling middleware for tests
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

describe('UsersController - XSS Security Tests', () => {
  describe('updateProfile', () => {
    test('should successfully update profile with normal input', async () => {
      const response = await request(app)
        .post('/api/users/profile')
        .send({
          name: 'John Doe',
          bio: 'Software developer from NYC',
          email: 'john@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('John Doe');
      expect(response.text).toContain('Software developer from NYC');
      expect(response.text).toContain('john@example.com');
      expect(response.text).toContain('User Profile Updated');
    });

    test('should prevent XSS attack via script tag in name', async () => {
      const response = await request(app)
        .post('/api/users/profile')
        .send({
          name: '<script>alert("XSS")</script>',
          bio: 'Normal bio',
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(response.text).not.toContain('<script>alert("XSS")</script>');
    });

    test('should prevent XSS attack via script tag in bio', async () => {
      const response = await request(app)
        .post('/api/users/profile')
        .send({
          name: 'Test User',
          bio: '<script>alert("XSS in bio")</script>',
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('&lt;script&gt;alert(&quot;XSS in bio&quot;)&lt;/script&gt;');
      expect(response.text).not.toContain('<script>alert("XSS in bio")</script>');
    });

    test('should prevent XSS attack via img tag with onerror', async () => {
      const response = await request(app)
        .post('/api/users/profile')
        .send({
          name: 'Test User',
          bio: '<img src=x onerror=alert(1)>',
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('&lt;img src=x onerror=alert(1)&gt;');
      expect(response.text).not.toContain('<img src=x onerror=alert(1)>');
    });

    test('should include security headers in response', async () => {
      const response = await request(app)
        .post('/api/users/profile')
        .send({
          name: 'Test User',
          bio: 'Test bio',
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-security-policy']).toBe("default-src 'self'");
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/users/profile')
        .send({
          name: 'Test User',
          bio: 'Test bio',
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Please provide a valid email address');
    });
  });
});
