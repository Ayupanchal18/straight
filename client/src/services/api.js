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

export const cricketApi = {
  // Live Scores
  getLiveScores: () => api.get('/live'),
  getMatchDetails: (url) => api.get(`/live/details?url=${encodeURIComponent(url)}`),

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
