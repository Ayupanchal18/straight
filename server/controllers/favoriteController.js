const Favorite = require('../models/Favorite');
const { isDbConnected } = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

// In-memory fallback if DB is not active
let inMemoryFavorites = [];

/**
 * GET /api/favorites
 */
const getFavorites = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const favorites = await Favorite.find().sort({ createdAt: -1 });
      return res.status(200).json({ status: 'success', data: favorites });
    }

    return res.status(200).json({ status: 'success', data: inMemoryFavorites, fallback: true });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/favorites
 */
const addFavorite = async (req, res, next) => {
  try {
    const { type, identifier, name, subtitle, image, meta } = req.body;

    if (!type || !identifier || !name) {
      throw new AppError('Type, identifier, and name are required fields.', 400);
    }

    if (isDbConnected()) {
      const fav = await Favorite.findOneAndUpdate(
        { type, identifier },
        { type, identifier, name, subtitle, image, meta },
        { upsert: true, new: true }
      );
      return res.status(201).json({ status: 'success', data: fav });
    }

    const existingIndex = inMemoryFavorites.findIndex(f => f.type === type && f.identifier === identifier);
    const newFav = { _id: Date.now().toString(), type, identifier, name, subtitle, image, meta, createdAt: new Date() };
    if (existingIndex >= 0) {
      inMemoryFavorites[existingIndex] = newFav;
    } else {
      inMemoryFavorites.unshift(newFav);
    }

    return res.status(201).json({ status: 'success', data: newFav, fallback: true });
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');

/**
 * DELETE /api/favorites/:id
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const isObjId = mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
      const condition = isObjId ? { $or: [{ _id: id }, { identifier: id }] } : { identifier: id };
      await Favorite.findOneAndDelete(condition);
      return res.status(200).json({ status: 'success', message: 'Favorite removed successfully.' });
    }

    inMemoryFavorites = inMemoryFavorites.filter(f => f._id !== id && f.identifier !== id);
    return res.status(200).json({ status: 'success', message: 'Favorite removed.', fallback: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
