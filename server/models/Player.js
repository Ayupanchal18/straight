const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  searchKey: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  name: { type: String, required: true },
  country: { type: String, default: 'International' },
  image: { type: String, default: null },
  role: { type: String, default: 'Cricketer' },
  cricbuzzUrl: { type: String },
  personalInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      born: '-',
      birthPlace: '-',
      height: '-',
      battingStyle: '-',
      bowlingStyle: '-',
      teams: [],
    }),
  },
  rankings: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      batting: { test: '--', odi: '--', t20: '--' },
      bowling: { test: '--', odi: '--', t20: '--' },
    }),
  },
  batting_stats: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  bowling_stats: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  lastScraped: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  strict: false,
});

PlayerSchema.index({ name: 'text', country: 'text' });

module.exports = mongoose.model('Player', PlayerSchema);
