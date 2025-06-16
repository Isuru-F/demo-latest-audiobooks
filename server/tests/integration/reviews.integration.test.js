const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../../index');

const REVIEWS_FILE = path.join(__dirname, '../../reviews.json');

describe('Reviews API Integration Tests', () => {
  beforeEach(async () => {
    // Clean up reviews file before each test
    try {
      await fs.unlink(REVIEWS_FILE);
    } catch (error) {
      // File doesn't exist, ignore
    }
  });

  afterEach(async () => {
    // Clean up reviews file after each test
    try {
      await fs.unlink(REVIEWS_FILE);
    } catch (error) {
      // File doesn't exist, ignore
    }
  });

  describe('POST /api/reviews', () => {
    it('should create a new review with valid data', async () => {
      const reviewData = {
        audiobookId: 'test-audiobook-1',
        rating: 5,
        comment: 'Excellent audiobook!'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(201);

      expect(response.body).toHaveProperty('reviewId');
      expect(response.body.audiobookId).toBe(reviewData.audiobookId);
      expect(response.body.rating).toBe(reviewData.rating);
      expect(response.body.comment).toBe(reviewData.comment);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 for missing audiobookId', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great book!'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(400);

      expect(response.body.error).toBe('Audiobook ID is required');
    });

    it('should return 400 for invalid rating', async () => {
      const reviewData = {
        audiobookId: 'test-audiobook-1',
        rating: 6,
        comment: 'Great book!'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(400);

      expect(response.body.error).toBe('Rating must be an integer between 1 and 5');
    });

    it('should return 400 for comment exceeding 500 characters', async () => {
      const longComment = 'a'.repeat(501);
      const reviewData = {
        audiobookId: 'test-audiobook-1',
        rating: 5,
        comment: longComment
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(400);

      expect(response.body.error).toBe('Comment must not exceed 500 characters');
    });

    it('should accept comment with exactly 500 characters', async () => {
      const maxComment = 'a'.repeat(500);
      const reviewData = {
        audiobookId: 'test-audiobook-1',
        rating: 5,
        comment: maxComment
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(201);

      expect(response.body.comment).toBe(maxComment);
    });
  });

  describe('GET /api/reviews/:audiobookId', () => {
    it('should return empty array for audiobook with no reviews', async () => {
      const response = await request(app)
        .get('/api/reviews/non-existent-audiobook')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return reviews for specific audiobook in descending order', async () => {
      const audiobookId = 'test-audiobook-1';
      
      // Create multiple reviews
      await request(app)
        .post('/api/reviews')
        .send({ audiobookId, rating: 4, comment: 'First review' });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await request(app)
        .post('/api/reviews')
        .send({ audiobookId, rating: 5, comment: 'Second review' });

      const response = await request(app)
        .get(`/api/reviews/${audiobookId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].comment).toBe('Second review');
      expect(response.body[1].comment).toBe('First review');
      // Verify newest first
      expect(new Date(response.body[0].timestamp).getTime()).toBeGreaterThan(
        new Date(response.body[1].timestamp).getTime()
      );
    });
  });

  describe('GET /api/reviews/:audiobookId/average', () => {
    it('should return 0 average for audiobook with no reviews', async () => {
      const response = await request(app)
        .get('/api/reviews/non-existent-audiobook/average')
        .expect(200);

      expect(response.body.averageRating).toBe(0);
      expect(response.body.totalReviews).toBe(0);
    });

    it('should calculate correct average rating', async () => {
      const audiobookId = 'test-audiobook-1';
      
      // Create reviews with ratings 5, 3, 4 (average = 4.0)
      await request(app)
        .post('/api/reviews')
        .send({ audiobookId, rating: 5, comment: 'Excellent' });
      
      await request(app)
        .post('/api/reviews')
        .send({ audiobookId, rating: 3, comment: 'Okay' });
      
      await request(app)
        .post('/api/reviews')
        .send({ audiobookId, rating: 4, comment: 'Good' });

      const response = await request(app)
        .get(`/api/reviews/${audiobookId}/average`)
        .expect(200);

      expect(response.body.averageRating).toBe(4.0);
      expect(response.body.totalReviews).toBe(3);
    });
  });
});
