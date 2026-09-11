const express = require('express');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');

const router = express.Router();

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;
