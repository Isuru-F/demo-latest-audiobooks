const spotifyService = require('../services/spotify.service');

const getNewReleases = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const country = req.query.country || 'US';
    const releases = await spotifyService.getNewReleases(limit, offset, country);
    res.json(releases);
  } catch (error) {
    next(error);
  }
};

const getAvailableGenres = async (req, res, next) => {
  try {
    const genres = await spotifyService.getAvailableGenres();
    res.json(genres);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNewReleases,
  getAvailableGenres
};