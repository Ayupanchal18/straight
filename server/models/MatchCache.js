const mongoose = require('mongoose');

const MatchCacheSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // MongoDB TTL index (1 hour default)
  },
});

module.exports = mongoose.model('MatchCache', MatchCacheSchema);
