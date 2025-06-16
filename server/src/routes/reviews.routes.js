const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews.controller');

// Submit new review
router.post('/', reviewsController.createReview);

// Get all reviews for a specific audiobook
router.get('/:audiobookId', reviewsController.getReviewsByAudiobookId);

// Get average rating for an audiobook
router.get('/:audiobookId/average', reviewsController.getAverageRating);

module.exports = router;
