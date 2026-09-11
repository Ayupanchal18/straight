const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crickethub',
  corsOrigin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || '*',
  cacheTTL: {
    liveScores: parseInt(process.env.CACHE_TTL_LIVE || '30', 10), // 30 seconds
    schedule: parseInt(process.env.CACHE_TTL_SCHEDULE || '3600', 10), // 1 hour
    playerStats: parseInt(process.env.CACHE_TTL_PLAYERS || '86400', 10), // 24 hours
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 mins
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  }
};

module.exports = config;
