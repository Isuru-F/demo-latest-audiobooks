const fs = require('fs').promises;
const path = require('path');
const reviewsService = require('../../src/services/reviews.service');

const REVIEWS_FILE = path.join(__dirname, '../../reviews.json');

describe('ReviewsService', () => {
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

  describe('createReview', () => {
    it('should create a new review with valid data', async () => {
      const audiobookId = 'test-audiobook-1';
      const rating = 5;
      const comment = 'Great audiobook!';

      const review = await reviewsService.createReview(audiobookId, rating, comment);

      expect(review).toHaveProperty('reviewId');
      expect(review.audiobookId).toBe(audiobookId);
      expect(review.rating).toBe(rating);
      expect(review.comment).toBe(comment);
      expect(review).toHaveProperty('timestamp');
      expect(typeof review.reviewId).toBe('string');
    });

    it('should store reviews in chronological order', async () => {
      const audiobookId = 'test-audiobook-1';
      
      const review1 = await reviewsService.createReview(audiobookId, 4, 'First review');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const review2 = await reviewsService.createReview(audiobookId, 5, 'Second review');

      const reviews = await reviewsService.getReviewsByAudiobookId(audiobookId);
      
      expect(reviews).toHaveLength(2);
      expect(new Date(reviews[0].timestamp)).toBeInstanceOf(Date);
      expect(new Date(reviews[1].timestamp)).toBeInstanceOf(Date);
      // Should return newest first
      expect(new Date(reviews[0].timestamp).getTime()).toBeGreaterThan(
        new Date(reviews[1].timestamp).getTime()
      );
    });
  });

  describe('getReviewsByAudiobookId', () => {
    it('should return empty array for non-existent audiobook', async () => {
      const reviews = await reviewsService.getReviewsByAudiobookId('non-existent');
      expect(reviews).toEqual([]);
    });

    it('should return only reviews for specified audiobook', async () => {
      await reviewsService.createReview('audiobook-1', 4, 'Review for book 1');
      await reviewsService.createReview('audiobook-2', 5, 'Review for book 2');
      await reviewsService.createReview('audiobook-1', 3, 'Another review for book 1');

      const reviews = await reviewsService.getReviewsByAudiobookId('audiobook-1');
      
      expect(reviews).toHaveLength(2);
      expect(reviews.every(review => review.audiobookId === 'audiobook-1')).toBe(true);
    });
  });

  describe('getAverageRating', () => {
    it('should return 0 average and 0 total for audiobook with no reviews', async () => {
      const result = await reviewsService.getAverageRating('non-existent');
      
      expect(result.averageRating).toBe(0);
      expect(result.totalReviews).toBe(0);
    });

    it('should calculate correct average rating', async () => {
      const audiobookId = 'test-audiobook';
      
      await reviewsService.createReview(audiobookId, 5, 'Great');
      await reviewsService.createReview(audiobookId, 3, 'Okay');
      await reviewsService.createReview(audiobookId, 4, 'Good');

      const result = await reviewsService.getAverageRating(audiobookId);
      
      expect(result.averageRating).toBe(4.0);
      expect(result.totalReviews).toBe(3);
    });

    it('should round average rating to 1 decimal place', async () => {
      const audiobookId = 'test-audiobook';
      
      await reviewsService.createReview(audiobookId, 5, 'Great');
      await reviewsService.createReview(audiobookId, 4, 'Good');

      const result = await reviewsService.getAverageRating(audiobookId);
      
      expect(result.averageRating).toBe(4.5);
      expect(result.totalReviews).toBe(2);
    });
  });
});
