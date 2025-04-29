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
      spotifyService.getAvailableGenres.mockResolvedValue(mockGenres);

      const response = await request(app)
        .get('/api/spotify/genres')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockGenres);
      expect(spotifyService.getAvailableGenres).toHaveBeenCalled();
    });

    it('should handle errors from the service', async () => {
      // Mock a service error
      spotifyService.getAvailableGenres.mockRejectedValue(new Error('API Error'));

      await request(app)
        .get('/api/spotify/genres')
        .expect(500);
    });
  });

  describe('GET /api/spotify/audiobooks', () => {
    it('should return audiobooks with default parameters', async () => {
      // Mock the getAudiobooks method
      const mockAudiobooks = {
        audiobooks: {
          items: [
            { id: '1', name: 'Audiobook 1' },
            { id: '2', name: 'Audiobook 2' }
          ]
        }
      };
      spotifyService.getAudiobooks.mockResolvedValue(mockAudiobooks);

      const response = await request(app)
        .get('/api/spotify/audiobooks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockAudiobooks);
      expect(spotifyService.getAudiobooks).toHaveBeenCalledWith(40, 0, 'AU', 'tag:new');
    });

    it('should pass custom parameters including search query to the service', async () => {
      // Mock the getAudiobooks method
      spotifyService.getAudiobooks.mockResolvedValue({ audiobooks: { items: [] } });

      await request(app)
        .get('/api/spotify/audiobooks?limit=10&offset=5&market=GB&query=harry%20potter')
        .expect(200);

      expect(spotifyService.getAudiobooks).toHaveBeenCalledWith(10, 5, 'GB', 'harry potter');
    });

    it('should handle errors from the service', async () => {
      // Mock a service error
      spotifyService.getAudiobooks.mockRejectedValue(new Error('API Error'));

      await request(app)
        .get('/api/spotify/audiobooks')
        .expect(500);
    });
  });
});