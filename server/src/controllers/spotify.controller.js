const spotifyService = require('../services/spotify.service');

class SpotifyController {
  async getNewReleases(req, res, next) {
    try {
      const { limit = 20, offset = 0, country = 'US' } = req.query;
      const data = await spotifyService.getNewReleases(limit, offset, country);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getGenres(req, res, next) {
    try {
      const data = await spotifyService.getGenres();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getAudiobooks(req, res, next) {
    try {
      const { limit = 40, offset = 0, market = 'AU' } = req.query;
      const data = await spotifyService.getAudiobooks(limit, offset, market);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpotifyController();