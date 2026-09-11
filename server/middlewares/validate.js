const { AppError } = require('./errorHandler');

const validatePlayerQuery = (req, res, next) => {
  const query = req.params.query || req.query.q || req.query.name;
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return next(new AppError('Player name/query is required.', 400));
  }
  if (query.trim().length > 80) {
    return next(new AppError('Player query is too long.', 400));
  }
  req.cleanQuery = query.trim().replace(/[<>]/g, '');
  next();
};

const validateComparison = (req, res, next) => {
  const { player1, player2 } = req.query;
  if (!player1 || !player2) {
    return next(new AppError('Both player1 and player2 query parameters are required for comparison.', 400));
  }
  req.cleanPlayer1 = player1.trim().replace(/[<>]/g, '');
  req.cleanPlayer2 = player2.trim().replace(/[<>]/g, '');
  next();
};

module.exports = { validatePlayerQuery, validateComparison };
