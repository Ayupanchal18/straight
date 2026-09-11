const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['player', 'match'],
    required: true,
  },
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: null,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

FavoriteSchema.index({ type: 1, identifier: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
