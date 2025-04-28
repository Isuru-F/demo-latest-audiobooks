const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');

// Get new releases
router.get('/new-releases', spotifyController.getNewReleases);

// Get available genres
router.get('/genres', spotifyController.getAvailableGenres);

module.exports = router;