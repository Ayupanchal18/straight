const scraperService = require('../services/scraperService');
const cacheService = require('../services/cacheService');
const { AppError } = require('../middlewares/errorHandler');

/**
 * GET /api/players/:query
 */
const getPlayerProfile = async (req, res, next) => {
  try {
    const query = req.cleanQuery;

    const result = await cacheService.getPlayer(query, async () => {
      // 1. Search Cricbuzz URL
      const profileUrl = await scraperService.searchPlayerProfileUrl(query);
      if (!profileUrl) {
        throw new AppError(`No player profile found for "${query}". Please check the spelling.`, 404);
      }

      // 2. Scrape Profile Details & Stats
      return await scraperService.scrapePlayerProfile(profileUrl, query);
    });

    if (!result || !result.data) {
      throw new AppError(`Player profile could not be found or parsed for "${query}".`, 404);
    }

    return res.status(200).json({
      status: 'success',
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/players/compare?player1=...&player2=...
 */
const comparePlayers = async (req, res, next) => {
  try {
    const p1 = req.cleanPlayer1;
    const p2 = req.cleanPlayer2;

    const [player1Result, player2Result] = await Promise.all([
      cacheService.getPlayer(p1, async () => {
        const url = await scraperService.searchPlayerProfileUrl(p1);
        if (!url) throw new AppError(`Could not find profile for player: "${p1}"`, 404);
        return await scraperService.scrapePlayerProfile(url, p1);
      }),
      cacheService.getPlayer(p2, async () => {
        const url = await scraperService.searchPlayerProfileUrl(p2);
        if (!url) throw new AppError(`Could not find profile for player: "${p2}"`, 404);
        return await scraperService.scrapePlayerProfile(url, p2);
      }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        player1: player1Result.data,
        player2: player2Result.data,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlayerProfile,
  comparePlayers,
};
