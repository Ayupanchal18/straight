const NodeCache = require('node-cache');
const config = require('../config/env');
const Player = require('../models/Player');
const MatchCache = require('../models/MatchCache');
const { isDbConnected } = require('../config/db');

// In-memory cache instance (fallback & fast L1 cache)
const memCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

class CacheService {
  /**
   * Get Live Scores (Cache L1 -> DB L2 -> Fallback)
   */
  async getLiveScores(fetchFn, forceFresh = false) {
    const cacheKey = 'live_scores';

    if (!forceFresh) {
      // 1. Check in-memory cache
      const memData = memCache.get(cacheKey);
      if (memData) {
        return { data: memData, source: 'memory-cache' };
      }

      // 2. Check MongoDB cache if connected and not expired
      if (isDbConnected()) {
        try {
          const dbCache = await MatchCache.findOne({ cacheKey });
          if (dbCache && dbCache.createdAt) {
            const ageSeconds = (Date.now() - new Date(dbCache.createdAt).getTime()) / 1000;
            if (ageSeconds < config.cacheTTL.liveScores) {
              memCache.set(cacheKey, dbCache.data, config.cacheTTL.liveScores - Math.floor(ageSeconds));
              return { data: dbCache.data, source: 'db-cache' };
            }
          }
        } catch (err) {
          console.warn('[CacheService] DB lookup error:', err.message);
        }
      }
    }

    // 3. Fetch Fresh Data
    const freshData = await fetchFn();

    // Store in-memory
    memCache.set(cacheKey, freshData, config.cacheTTL.liveScores);

    // Store in MongoDB
    if (isDbConnected()) {
      try {
        await MatchCache.findOneAndUpdate(
          { cacheKey },
          { data: freshData, createdAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('[CacheService] DB save error:', err.message);
      }
    }

    return { data: freshData, source: 'live' };
  }

  /**
   * Get Schedule (Cache L1 -> DB L2 -> Live)
   */
  async getSchedule(fetchFn) {
    const cacheKey = 'match_schedule';

    const memData = memCache.get(cacheKey);
    if (memData && Array.isArray(memData) && memData.length > 0) {
      return { data: memData, source: 'memory-cache' };
    }

    if (isDbConnected()) {
      try {
        const dbCache = await MatchCache.findOne({ cacheKey });
        if (dbCache && dbCache.data && Array.isArray(dbCache.data) && dbCache.data.length > 0) {
          memCache.set(cacheKey, dbCache.data, config.cacheTTL.schedule);
          return { data: dbCache.data, source: 'db-cache' };
        }
      } catch (err) {
        console.warn('[CacheService] Schedule DB lookup error:', err.message);
      }
    }

    const freshData = await fetchFn();
    if (Array.isArray(freshData) && freshData.length > 0) {
      memCache.set(cacheKey, freshData, config.cacheTTL.schedule);

      if (isDbConnected()) {
        try {
          await MatchCache.findOneAndUpdate(
            { cacheKey },
            { data: freshData, createdAt: new Date() },
            { upsert: true, new: true }
          );
        } catch (err) {
          console.warn('[CacheService] Schedule DB save error:', err.message);
        }
      }
    }

    return { data: freshData, source: 'live' };
  }

  /**
   * Helper to check if cached player profile data is valid and not corrupted
   */
  isValidPlayerRecord(data, searchKey = '') {
    if (!data || !data.name) return false;
    if (data.country === 'November' || data.country === 'Videos') return false;
    if (data.batting_stats?.test?.matches === 'Matches') return false;

    // Reject mismatched player data (e.g. searching 'jason behrandoff' returning 'Virat Kohli')
    if (searchKey && data.name) {
      const cleanName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSearch = searchKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameParts = data.name.toLowerCase().split(/\s+/);
      const isMatch = cleanName.includes(cleanSearch) ||
                      cleanSearch.includes(cleanName) ||
                      nameParts.some(part => part.length >= 3 && cleanSearch.includes(part));
      if (!isMatch) return false;
    }
    return true;
  }

  /**
   * Get Cached Player Profile or Scrape & Cache
   */
  async getPlayer(cleanQuery, scrapeFn) {
    const searchKey = cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    const memKey = `player_${searchKey}`;

    // 1. In-memory check
    const memData = memCache.get(memKey);
    if (memData && this.isValidPlayerRecord(memData, searchKey)) {
      return { data: memData, source: 'memory-cache' };
    }

    // 2. MongoDB check
    if (isDbConnected()) {
      try {
        const dbPlayer = await Player.findOne({ searchKey });
        if (dbPlayer && this.isValidPlayerRecord(dbPlayer, searchKey)) {
          // If less than 24 hours old, return cached
          const isStale = (Date.now() - new Date(dbPlayer.lastScraped).getTime()) > config.cacheTTL.playerStats * 1000;
          if (!isStale) {
            memCache.set(memKey, dbPlayer, config.cacheTTL.playerStats);
            return { data: dbPlayer, source: 'db-cache' };
          }
        }
      } catch (err) {
        console.warn('[CacheService] Player DB lookup error:', err.message);
      }
    }

    // 3. Scrape Fresh Data
    const scrapedData = await scrapeFn();
    if (!scrapedData) return null;

    const playerObject = {
      ...scrapedData,
      searchKey,
    };

    // Save in Memory
    memCache.set(memKey, playerObject, config.cacheTTL.playerStats);

    // Save/Update in MongoDB
    if (isDbConnected()) {
      try {
        const savedPlayer = await Player.findOneAndUpdate(
          { searchKey },
          { ...playerObject, lastScraped: new Date() },
          { upsert: true, new: true }
        );
        return { data: savedPlayer, source: 'live-scraped' };
      } catch (err) {
        console.warn('[CacheService] Player DB upsert error:', err.message);
      }
    }

    return { data: playerObject, source: 'live-scraped' };
  }
}

module.exports = new CacheService();
