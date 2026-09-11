const express = require('express');
const { getPlayerProfile, comparePlayers } = require('../controllers/playerController');
const { validatePlayerQuery, validateComparison } = require('../middlewares/validate');
const { searchLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Compare two players: /api/players/compare?player1=...&player2=...
router.get('/compare', searchLimiter, validateComparison, comparePlayers);

// Get single player: /api/players/:query
router.get('/:query', searchLimiter, validatePlayerQuery, getPlayerProfile);

module.exports = router;
