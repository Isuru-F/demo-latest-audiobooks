const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');

// Spotify API routes
router.get('/spotify/new-releases', spotifyController.getNewReleases);
router.get('/spotify/genres', spotifyController.getGenres);
router.get('/spotify/audiobooks', spotifyController.getAudiobooks);

module.exports = router;