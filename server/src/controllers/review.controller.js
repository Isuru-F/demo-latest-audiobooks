const reviewService = require('../services/review.service');

class ReviewController {
  async submitReview(req, res, next) {
    try {
      const { audiobookId, rating, comment } = req.body;

      // Validation
      if (!audiobookId) {
        return res.status(400).json({ error: 'audiobookId is required' });
      }

      if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
      }

      if (comment && comment.length > 500) {
        return res.status(400).json({ error: 'comment must be 500 characters or less' });
      }

      const review = await reviewService.addReview({
        audiobookId,
        rating,
        comment: comment?.trim() || null
      });

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req, res, next) {
    try {
      const { audiobookId } = req.params;

      if (!audiobookId) {
        return res.status(400).json({ error: 'audiobookId is required' });
      }

      const reviews = await reviewService.getReviewsByAudiobookId(audiobookId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async getAverageRating(req, res, next) {
    try {
      const { audiobookId } = req.params;

      if (!audiobookId) {
        return res.status(400).json({ error: 'audiobookId is required' });
      }

      const averageData = await reviewService.getAverageRating(audiobookId);
      res.json(averageData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
