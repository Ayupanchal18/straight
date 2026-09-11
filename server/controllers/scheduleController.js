const scraperService = require('../services/scraperService');
const cacheService = require('../services/cacheService');

/**
 * GET /api/schedule
 */
const getSchedule = async (req, res, next) => {
  try {
    const result = await cacheService.getSchedule(() => scraperService.scrapeSchedule());

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

module.exports = { getSchedule };
