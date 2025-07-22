const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');
const usersRoutes = require('./users.routes');
const configRoutes = require('./config.routes');

// Spotify API routes
router.get('/spotify/new-releases', spotifyController.getNewReleases);
router.get('/spotify/genres', spotifyController.getGenres);
router.get('/spotify/audiobooks', spotifyController.getAudiobooks);

// Users API routes (CONTAINS VULNERABILITIES FOR DEMO)
router.use('/users', usersRoutes);

// Configuration API routes - VULNERABLE ENDPOINTS
router.use('/config', configRoutes);

module.exports = router;