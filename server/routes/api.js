const express = require('express');
const liveRoutes = require('./liveRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const playerRoutes = require('./playerRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const { isDbConnected } = require('../config/db');

const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'cricket-hub-api',
    uptime: process.uptime(),
    dbConnected: isDbConnected(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routers
router.use('/live', liveRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/players', playerRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;
