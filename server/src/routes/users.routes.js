const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

// VULNERABLE ENDPOINT - FOR DEMO PURPOSES
// POST /profile - Updates user profile with XSS vulnerability
router.post('/profile', usersController.updateProfile);

module.exports = router;
