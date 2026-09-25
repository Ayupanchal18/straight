import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
let resolvedBaseUrl = '/api';

if (rawApiUrl) {
  const cleaned = rawApiUrl.replace(/\/+$/, '');
  resolvedBaseUrl = cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
}

const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Client-side in-memory cache for instant 0ms modal opening
const detailsClientCache = new Map();
const inFlightPrefetches = new Map();

export const cricketApi = {
  // Live Scores (supports hard refresh to bypass cache)
  getLiveScores: (forceFresh = false) => api.get(forceFresh ? '/live?fresh=true' : '/live'),

  // Instant-Cached Match Details
  getMatchDetails: async (url, forceFresh = false) => {
    if (!url) return null;
    const cacheKey = url;
    const now = Date.now();

    if (!forceFresh && detailsClientCache.has(cacheKey)) {
      const entry = detailsClientCache.get(cacheKey);
      if (now - entry.timestamp < 15000) { // 15s fresh client cache
        return entry.data;
      }
    }

    if (inFlightPrefetches.has(cacheKey)) {
      return inFlightPrefetches.get(cacheKey);
    }

    const fetchUrl = `/live/details?url=${encodeURIComponent(url)}${forceFresh ? '&fresh=true' : ''}`;
    const fetchPromise = api.get(fetchUrl)
      .then((res) => {
        detailsClientCache.set(cacheKey, { data: res, timestamp: Date.now() });
        return res;
      })
      .finally(() => {
        inFlightPrefetches.delete(cacheKey);
      });

    inFlightPrefetches.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  // Predictive Hover Prefetch: primes cache during 150-200ms cursor hover before click
  prefetchMatchDetails: (url) => {
    if (!url) return;
    const cacheKey = url;
    const entry = detailsClientCache.get(cacheKey);
    if (entry && (Date.now() - entry.timestamp < 15000)) {
      return; // Already warm in memory
    }
    if (inFlightPrefetches.has(cacheKey)) {
      return; // In-flight
    }

    const fetchPromise = api.get(`/live/details?url=${encodeURIComponent(url)}`)
      .then((res) => {
        detailsClientCache.set(cacheKey, { data: res, timestamp: Date.now() });
        return res;
      })
      .catch(() => {}) // Silent fail for prefetch
      .finally(() => {
        inFlightPrefetches.delete(cacheKey);
      });

    inFlightPrefetches.set(cacheKey, fetchPromise);
  },

  // Upcoming Schedule
  getSchedule: () => api.get('/schedule'),

  // Player Profile & Career Stats
  getPlayerProfile: (query) => api.get(`/players/${encodeURIComponent(query)}`),

  // Player Comparison
  comparePlayers: (p1, p2) => 
    api.get(`/players/compare?player1=${encodeURIComponent(p1)}&player2=${encodeURIComponent(p2)}`),

  // Favorites / Watchlist
  getFavorites: () => api.get('/favorites'),
  addFavorite: (favData) => api.post('/favorites', favData),
  removeFavorite: (id) => api.delete(`/favorites/${id}`),

  // Health check
  checkHealth: () => api.get('/health'),
};

export default cricketApi;
