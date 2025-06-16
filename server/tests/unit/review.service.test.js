const fs = require('fs').promises;
const reviewService = require('../../src/services/review.service');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('ReviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readReviews', () => {
    it('should return empty array when file does not exist', async () => {
      fs.readFile.mockRejectedValue({ code: 'ENOENT' });
      
      const result = await reviewService.readReviews();
      
      expect(result).toEqual([]);
    });

    it('should return parsed reviews when file exists', async () => {
      const mockReviews = [{ id: '1', audiobookId: 'book1', rating: 5 }];
      fs.readFile.mockResolvedValue(JSON.stringify(mockReviews));
      
      const result = await reviewService.readReviews();
      
      expect(result).toEqual(mockReviews);
    });
  });

  describe('addReview', () => {
    it('should add new review with timestamp and id', async () => {
      fs.readFile.mockRejectedValue({ code: 'ENOENT' });
      fs.writeFile.mockResolvedValue();
      
      const reviewData = {
        audiobookId: 'book1',
        rating: 4,
        comment: 'Great book!'
      };

      const result = await reviewService.addReview(reviewData);

      expect(result).toMatchObject({
        audiobookId: 'book1',
        rating: 4,
        comment: 'Great book!'
      });
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getReviewsByAudiobookId', () => {
    it('should return reviews for specific audiobook', async () => {
      const mockReviews = [
        { id: '1', audiobookId: 'book1', rating: 5 },
        { id: '2', audiobookId: 'book2', rating: 3 },
        { id: '3', audiobookId: 'book1', rating: 4 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockReviews));

      const result = await reviewService.getReviewsByAudiobookId('book1');

      expect(result).toHaveLength(2);
      expect(result[0].audiobookId).toBe('book1');
      expect(result[1].audiobookId).toBe('book1');
    });
  });

  describe('getAverageRating', () => {
    it('should return 0 average when no reviews exist', async () => {
      fs.readFile.mockRejectedValue({ code: 'ENOENT' });

      const result = await reviewService.getAverageRating('book1');

      expect(result).toEqual({ average: 0, count: 0 });
    });

    it('should calculate correct average rating', async () => {
      const mockReviews = [
        { id: '1', audiobookId: 'book1', rating: 5 },
        { id: '2', audiobookId: 'book1', rating: 3 },
        { id: '3', audiobookId: 'book1', rating: 4 }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockReviews));

      const result = await reviewService.getAverageRating('book1');

      expect(result).toEqual({ average: 4.0, count: 3 });
    });
  });
});
