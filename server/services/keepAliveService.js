const axios = require('axios');

/**
 * Keep-Alive Service to prevent free tier instances (e.g. Render) from spinning down.
 * Render spins down free services after 15 minutes of inactivity.
 * Pinging every 14 minutes through public URL keeps the service active while running.
 */
function initKeepAlive() {
  const targetUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;
  const isEnabled = process.env.ENABLE_KEEP_ALIVE !== 'false' && Boolean(targetUrl);

  if (!isEnabled) {
    if (process.env.NODE_ENV === 'production' && !targetUrl) {
      console.log('💡 [KeepAlive] Tip: Set KEEP_ALIVE_URL or use UptimeRobot pointing to /health to keep Render awake 24/7.');
    }
    return;
  }

  // Sanitize URL
  const normalizedUrl = targetUrl.endsWith('/') ? targetUrl.slice(0, -1) : targetUrl;
  const healthEndpoint = `${normalizedUrl}/health`;
  const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes (Render idle timeout is 15m)

  console.log(`⏱️ [KeepAlive] Keep-alive service initialized. Target: ${healthEndpoint} (Interval: 14m)`);

  setInterval(async () => {
    try {
      const response = await axios.get(healthEndpoint, {
        timeout: 10000,
        headers: { 'User-Agent': 'CricketHub-SelfKeepAlive/2.0' }
      });
      console.log(`💓 [KeepAlive] Heartbeat ping successful (${response.status}) at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.warn(`⚠️ [KeepAlive] Heartbeat ping warning: ${error.message}`);
    }
  }, PING_INTERVAL_MS);
}

module.exports = { initKeepAlive };
