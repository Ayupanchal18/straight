const NodeCache = require('node-cache');
const config = require('../config/env');
const Player = require('../models/Player');
const MatchCache = require('../models/MatchCache');
const { isDbConnected } = require('../config/db');

// In-memory cache instance (fallback & fast L1 cache)
const memCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// In-flight single-promise lock to prevent cache stampedes / dog-piling
let inFlightLiveScoresPromise = null;
let lastKnownLiveScores = null;
const inFlightDetailsMap = new Map();

// Polite Scraping & Rate Cooldown Controls
// Enforces minimum gap between outbound calls and handles upstream backoffs gracefully
const MIN_FORCE_REFRESH_COOLDOWN_MS = 5000; // 5-second minimum gap between outbound scrapes
let lastLiveScoresScrapeTime = 0;
let liveScoresBackoffUntil = 0;
const lastDetailsScrapeMap = new Map();
const detailsBackoffMap = new Map();

class CacheService {
  /**
   * Get Live Scores (Single-flight lock -> Memory Cache -> DB Cache -> Fresh Telemetry)
   */
  async getLiveScores(fetchFn, forceFresh = false) {
    const cacheKey = 'live_scores';
    const now = Date.now();

    // 1. Check if we are in a backoff period from upstream rate limiting
    if (now < liveScoresBackoffUntil && lastKnownLiveScores) {
      return { data: lastKnownLiveScores, source: 'backoff-cooldown' };
    }

    // 2. Politeness Guard: Even on forceFresh, enforce 5-second cooldown to protect origin server
    if (forceFresh && (now - lastLiveScoresScrapeTime) < MIN_FORCE_REFRESH_COOLDOWN_MS) {
      const memData = memCache.get(cacheKey) || lastKnownLiveScores;
      if (memData && Array.isArray(memData) && memData.length > 0) {
        return { data: memData, source: 'cooldown-cache' };
      }
    }

    if (!forceFresh) {
      // Check in-memory cache (<1ms response)
      const memData = memCache.get(cacheKey);
      if (memData && Array.isArray(memData) && memData.length > 0) {
        return { data: memData, source: 'memory-cache' };
      }

      // Check MongoDB cache if connected and not expired
      if (isDbConnected()) {
        try {
          const dbCache = await MatchCache.findOne({ cacheKey });
          if (dbCache && dbCache.createdAt && Array.isArray(dbCache.data) && dbCache.data.length > 0) {
            const ageSeconds = (Date.now() - new Date(dbCache.createdAt).getTime()) / 1000;
            if (ageSeconds < config.cacheTTL.liveScores) {
              memCache.set(cacheKey, dbCache.data, Math.max(5, config.cacheTTL.liveScores - Math.floor(ageSeconds)));
              lastKnownLiveScores = dbCache.data;
              return { data: dbCache.data, source: 'db-cache' };
            }
          }
        } catch (err) {
          console.warn('[CacheService] DB lookup error:', err.message);
        }
      }
    }

    // 3. Single-flight lock: if another request is already fetching fresh telemetry, await it
    if (inFlightLiveScoresPromise) {
      try {
        const sharedData = await inFlightLiveScoresPromise;
        return { data: sharedData, source: 'live-shared' };
      } catch (e) {
        if (lastKnownLiveScores) {
          return { data: lastKnownLiveScores, source: 'stale-fallback' };
        }
      }
    }

    // 4. Fetch Fresh Data through Single Flight
    inFlightLiveScoresPromise = (async () => {
      try {
        const freshData = await fetchFn();
        if (Array.isArray(freshData) && freshData.length > 0) {
          lastLiveScoresScrapeTime = Date.now();
          lastKnownLiveScores = freshData;
          memCache.set(cacheKey, freshData, config.cacheTTL.liveScores);

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
          return freshData;
        }
        return lastKnownLiveScores || [];
      } finally {
        inFlightLiveScoresPromise = null;
      }
    })();

    try {
      const freshData = await inFlightLiveScoresPromise;
      return { data: freshData, source: 'live' };
    } catch (err) {
      // Circuit breaker: back off if origin responds with 429 or 503
      if (err.response?.status === 429 || err.response?.status === 503) {
        liveScoresBackoffUntil = Date.now() + 30000; // 30s polite backoff
        console.warn('[CacheService] Upstream rate limit reached. Backing off for 30s.');
      }
      if (lastKnownLiveScores) {
        console.warn('[CacheService] Scraper error, serving last known live scores fallback:', err.message);
        return { data: lastKnownLiveScores, source: 'stale-fallback' };
      }
      throw err;
    }
  }

  /**
   * Get Match Details (In-Memory Micro-Cache with Single-Flight Lock & Polite Cooldown)
   * 15s TTL for active matches, 10m TTL for completed matches
   */
  async getMatchDetails(url, fetchFn, forceFresh = false) {
    const cleanKey = `match_detail_${encodeURIComponent(url).slice(-40)}`;
    const now = Date.now();

    // 1. Check circuit breaker backoff
    const backoffUntil = detailsBackoffMap.get(cleanKey) || 0;
    if (now < backoffUntil) {
      const cached = memCache.get(cleanKey);
      if (cached) return { data: cached, source: 'backoff-cooldown' };
    }

    // 2. Politeness cooldown on forceFresh (5s minimum)
    const lastScraped = lastDetailsScrapeMap.get(cleanKey) || 0;
    if (forceFresh && (now - lastScraped) < MIN_FORCE_REFRESH_COOLDOWN_MS) {
      const cached = memCache.get(cleanKey);
      if (cached) return { data: cached, source: 'cooldown-cache' };
    }

    if (!forceFresh) {
      const cached = memCache.get(cleanKey);
      if (cached) {
        return { data: cached, source: 'memory-cache' };
      }
    }

    // 3. Single-flight lock: reuse active outbound fetch promise
    if (inFlightDetailsMap.has(cleanKey)) {
      const shared = await inFlightDetailsMap.get(cleanKey);
      return { data: shared, source: 'live-shared' };
    }

    const fetchPromise = (async () => {
      try {
        const fresh = await fetchFn();
        if (fresh) {
          lastDetailsScrapeMap.set(cleanKey, Date.now());
          const isComplete = Boolean(
            fresh.isComplete || 
            (fresh.status && (fresh.status.toLowerCase().includes('won') || fresh.status.toLowerCase().includes('drawn') || fresh.status.toLowerCase().includes('tied')))
          );
          const ttl = isComplete ? 600 : 15; // 10 mins if completed, 15s if live
          memCache.set(cleanKey, fresh, ttl);
        }
        return fresh;
      } catch (err) {
        if (err.response?.status === 429 || err.response?.status === 503) {
          detailsBackoffMap.set(cleanKey, Date.now() + 30000); // 30s polite backoff
          console.warn(`[CacheService] Upstream rate limit for match ${cleanKey}. Backing off for 30s.`);
        }
        throw err;
      } finally {
        inFlightDetailsMap.delete(cleanKey);
      }
    })();

    inFlightDetailsMap.set(cleanKey, fetchPromise);
    const data = await fetchPromise;
    return { data, source: 'live' };
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
