const express = require('express');
const { getLiveScores, getMatchDetails } = require('../controllers/liveController');

const router = express.Router();

router.get('/', getLiveScores);
router.get('/details', getMatchDetails);

module.exports = router;
