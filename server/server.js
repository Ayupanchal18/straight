const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { errorHandler, AppError } = require('./middlewares/errorHandler');
const apiRoutes = require('./routes/api');

const app = express();

// Trust reverse proxy headers (Render, Heroku, Nginx)
app.set('trust proxy', 1);

// Database Connection
connectDB();

// Middlewares
const allowedOrigins = [
  config.corsOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests, same-origin, configured origin, or any onrender.com origin
    if (!origin || config.corsOrigin === '*' || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter to API
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Static Client Asset Serving (Monolith / Production mode on Render)
const clientDistPath = path.join(__dirname, '../client/dist');
const hasClientDist = fs.existsSync(clientDistPath);

if (hasClientDist) {
  app.use(express.static(clientDistPath));

  // Catch-all route to serve SPA frontend for client-side routing
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Standalone API mode Root Welcome / Discovery
  app.get('/', (req, res) => {
    res.json({
      message: '🏏 Welcome to Cricket Hub Scalable API 2.0 (MERN Edition)',
      version: '2.0.0',
      status: 'online',
      documentation: {
        health: 'GET /api/health',
        live: 'GET /api/live',
        schedule: 'GET /api/schedule',
        playerProfile: 'GET /api/players/:playerName',
        playerCompare: 'GET /api/players/compare?player1=...&player2=...',
        favorites: 'GET /api/favorites, POST /api/favorites, DELETE /api/favorites/:id',
      }
    });
  });
}

// Handle unhandled routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// Global Centralized Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`🚀 [Cricket Hub API] Running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

module.exports = app;
