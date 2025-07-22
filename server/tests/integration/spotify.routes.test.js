const request = require('supertest');
const app = require('../../index');
const spotifyService = require('../../src/services/spotify.service');

// Mock the Spotify service
jest.mock('../../src/services/spotify.service');

describe('Spotify API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/spotify/new-releases', () => {
    it('should return new releases', async () => {
      // Mock the getNewReleases method
      const mockReleases = {
        albums: {
          items: [
            { id: '1', name: 'Album 1' },
            { id: '2', name: 'Album 2' }
          ]
        }
      };
      spotifyService.getNewReleases.mockResolvedValue(mockReleases);

      const response = await request(app)
        .get('/api/spotify/new-releases')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockReleases);
      expect(spotifyService.getNewReleases).toHaveBeenCalledWith(20, 0, 'US');
    });

    it('should pass custom query parameters to the service', async () => {
      // Mock the getNewReleases method
      spotifyService.getNewReleases.mockResolvedValue({ albums: { items: [] } });

      await request(app)
        .get('/api/spotify/new-releases?limit=10&offset=5&country=GB')
        .expect(200);

      expect(spotifyService.getNewReleases).toHaveBeenCalledWith(10, 5, 'GB');
    });

    it('should handle errors from the service', async () => {
      // Mock a service error
      spotifyService.getNewReleases.mockRejectedValue(new Error('API Error'));

      await request(app)
        .get('/api/spotify/new-releases')
        .expect(500);
    });
  });

  describe('GET /api/spotify/genres', () => {
    it('should return available genres', async () => {
      // Mock the getAvailableGenres method
      const mockGenres = {
        genres: ['rock', 'pop', 'hip-hop']
      };
      spotifyService.getGenres.mockResolvedValue(mockGenres);

      const response = await request(app)
        .get('/api/spotify/genres')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockGenres);
      expect(spotifyService.getGenres).toHaveBeenCalled();
    });

    it('should handle errors from the service', async () => {
      // Mock a service error
      spotifyService.getGenres.mockRejectedValue(new Error('API Error'));

      await request(app)
        .get('/api/spotify/genres')
        .expect(500);
    });
  });
});