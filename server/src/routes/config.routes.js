const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');

// Configuration management routes
router.post('/update', configController.updateConfig);
router.get('/current', configController.getConfig);

module.exports = router;
