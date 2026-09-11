const scraperService = require('../services/scraperService');
const cacheService = require('../services/cacheService');

/**
 * GET /api/live
 */
const getLiveScores = async (req, res, next) => {
  try {
    const forceFresh = req.query.fresh === 'true';
    const result = await cacheService.getLiveScores(() => scraperService.scrapeLiveMatches(), forceFresh);

    return res.status(200).json({
      status: 'success',
      source: result.source,
      count: result.data.length,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/live/details?url=...
 */
const getMatchDetails = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ status: 'fail', message: 'Match URL is required.' });
    }

    const details = await scraperService.scrapeMatchDetails(url);

    return res.status(200).json({
      status: 'success',
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLiveScores, getMatchDetails };
