const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');
const reviewController = require('../controllers/review.controller');

// Spotify API routes
router.get('/spotify/new-releases', spotifyController.getNewReleases);
router.get('/spotify/genres', spotifyController.getGenres);
router.get('/spotify/audiobooks', spotifyController.getAudiobooks);

// Review API routes
router.post('/reviews', reviewController.submitReview);
router.get('/reviews/:audiobookId', reviewController.getReviews);
router.get('/reviews/:audiobookId/average', reviewController.getAverageRating);

module.exports = router;