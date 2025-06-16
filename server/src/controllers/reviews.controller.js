const reviewsService = require('../services/reviews.service');

class ReviewsController {
  async createReview(req, res, next) {
    try {
      const { audiobookId, rating, comment } = req.body;

      // Validation
      if (!audiobookId) {
        return res.status(400).json({ error: 'Audiobook ID is required' });
      }

      if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }

      if (!comment || typeof comment !== 'string') {
        return res.status(400).json({ error: 'Comment is required and must be a string' });
      }

      if (comment.length > 500) {
        return res.status(400).json({ error: 'Comment must not exceed 500 characters' });
      }

      const review = await reviewsService.createReview(audiobookId, rating, comment.trim());
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByAudiobookId(req, res, next) {
    try {
      const { audiobookId } = req.params;

      if (!audiobookId) {
        return res.status(400).json({ error: 'Audiobook ID is required' });
      }

      const reviews = await reviewsService.getReviewsByAudiobookId(audiobookId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async getAverageRating(req, res, next) {
    try {
      const { audiobookId } = req.params;

      if (!audiobookId) {
        return res.status(400).json({ error: 'Audiobook ID is required' });
      }

      const averageData = await reviewsService.getAverageRating(audiobookId);
      res.json(averageData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewsController();
