const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { errorHandler, AppError } = require('./middlewares/errorHandler');
const { initKeepAlive } = require('./services/keepAliveService');
const apiRoutes = require('./routes/api');

const compression = require('compression');
const app = express();

// Enable Gzip/Brotli response compression for all responses
app.use(compression({
  threshold: 1024, // Compress responses above 1KB
  level: 6
}));

// Security hardening: disable framework fingerprinting and set defensive headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root Health Check for Monitoring Tools (UptimeRobot, cron-job.org, Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'cricket-hub-api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Dynamic XML Sitemap Generator (Indexing all core routes and 1,100+ player profiles)
app.get('/sitemap.xml', (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    let playerKeys = [];
    const registryPath = path.join(__dirname, 'data/playerRegistry.json');
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      playerKeys = Object.keys(registry);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Views -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=live</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=schedule</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=players</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=compare</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=favorites</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Player Profiles (${playerKeys.length} verified players) -->
${playerKeys.map(k => `  <url>
    <loc>${baseUrl}/?tab=players&amp;player=${encodeURIComponent(k)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Search Engine Robots.txt
app.get('/robots.txt', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const content = `User-agent: *
Allow: /
Disallow: /api/admin/
Disallow: /node_modules/

Sitemap: ${protocol}://${host}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(content);
});

// LLM Crawler File (llms.txt specification)
app.get('/llms.txt', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  const content = `# CricketHub

> Real-time live cricket scores, ball-by-ball commentary, match schedules, ICC player rankings, comprehensive career statistics, and head-to-head player comparisons.

## Core Features & Sections

- [Live Cricket Scores](${baseUrl}/?tab=live): Real-time live scores, ball-by-ball commentary, batting partnerships, and miniscores for international and league cricket matches.
- [Upcoming Match Schedules](${baseUrl}/?tab=schedule): Timetable of bilateral tours, upcoming series, ICC tournaments, venues, and starting times.
- [Player Statistics & Profiles](${baseUrl}/?tab=players): Detailed career batting averages, strike rates, bowling figures, and personal records for over 1,190+ verified international cricket players.
- [Head-to-Head Player Comparison](${baseUrl}/?tab=compare): Side-by-side performance analytics, radar charts, and format-by-format breakdowns across Test, ODI, T20I, and IPL matches.

## API Documentation & Endpoints

- [Live Scores API](${baseUrl}/api/live): JSON feed of current live and completed matches.
- [Upcoming Schedules API](${baseUrl}/api/schedule): JSON list of upcoming cricket fixtures.
- [Player Profiles API](${baseUrl}/api/players/viratkohli): JSON career statistics and biographical data.
- [XML Sitemap](${baseUrl}/sitemap.xml): Machine-readable index of all site pages and player profiles.
- [Robots Directives](${baseUrl}/robots.txt): Search engine crawler directives.

## Optional & Extended Details

- [Full Documentation](${baseUrl}/llms-full.txt): Extended platform architecture and statistical model.
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(content);
});

app.get('/llms-full.txt', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  const content = `# CricketHub — Full Platform Reference

> An enterprise cricket intelligence platform offering real-time live ball-by-ball commentary, career stats across formats, player comparisons, and automated fixture tracking.

## Overview
CricketHub provides real-time cricket data aggregation from authoritative international sources. The platform includes:
- Live match tracking with dynamic miniscore cards, partnership analysis, and recent over progressions.
- Comprehensive career profiles across Test, ODI, T20I, and domestic/T20 leagues (IPL, BBL, CPL, PSL).
- Multi-dimensional radar charts for head-to-head player comparison.
- Verified registry of over 1,190+ international cricket players.

## Canonical Web URLs
- [Home & Live Scores](${baseUrl}/?tab=live)
- [Match Fixtures & Timetable](${baseUrl}/?tab=schedule)
- [Player Search & Analytics](${baseUrl}/?tab=players)
- [Player Comparison](${baseUrl}/?tab=compare)

## JSON API Reference
- \`GET /api/live\`: Real-time array of active, upcoming, and completed matches.
- \`GET /api/schedule\`: Comprehensive schedule of international and league fixtures.
- \`GET /api/players/:name\`: Career statistics, biographical info, and ICC rankings for any player.
- \`GET /api/players/compare/:p1/:p2\`: Side-by-side JSON comparison of two players across all formats.
- \`GET /sitemap.xml\`: Complete search engine sitemap containing 1,193+ player profile URLs.
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(content);
});

// Apply general rate limiter to API
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Static Client Asset Serving (Monolith / Production mode on Render)
const clientDistPath = path.join(__dirname, '../client/dist');
const hasClientDist = fs.existsSync(clientDistPath);

if (hasClientDist) {
  // Serve hashed assets with long-term immutable caching (1 year)
  app.use('/assets', express.static(path.join(clientDistPath, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }));

  // Serve other root static files with standard cache validation
  app.use(express.static(clientDistPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // Catch-all route to serve SPA frontend for client-side routing
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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
  // Initialize background self-pinger if configured or running on Render
  initKeepAlive();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

module.exports = app;
