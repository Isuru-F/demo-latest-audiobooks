const axios = require('axios');
const spotifyService = require('../../src/services/spotify.service');

// Mock axios
jest.mock('axios');

describe('Spotify Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset token and expiry
    spotifyService.accessToken = null;
    spotifyService.tokenExpiry = null;
  });

  describe('getAccessToken', () => {
    it('should fetch a new token when no token exists', async () => {
      // Mock the token response
      axios.mockResolvedValueOnce({
        data: {
          access_token: 'mock-access-token',
          expires_in: 3600
        }
      });

      const token = await spotifyService.getAccessToken();

      expect(token).toBe('mock-access-token');
      expect(axios).toHaveBeenCalledTimes(1);
      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: expect.any(Object),
        data: 'grant_type=client_credentials'
      });
    });

    it('should return existing token if it is still valid', async () => {
      // Set a mock token and future expiry time
      spotifyService.accessToken = 'existing-token';
      spotifyService.tokenExpiry = Date.now() + 1000000; // Far future

      const token = await spotifyService.getAccessToken();

      expect(token).toBe('existing-token');
      expect(axios).not.toHaveBeenCalled();
    });
  });

  describe('getNewReleases', () => {
    it('should fetch new releases with default parameters', async () => {
      // Mock the access token
      jest.spyOn(spotifyService, 'getAccessToken').mockResolvedValue('mock-token');

      // Mock the response
      axios.mockResolvedValueOnce({
        data: { albums: { items: [] } }
      });

      await spotifyService.getNewReleases();

      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.spotify.com/v1/browse/new-releases',
        headers: { 'Authorization': 'Bearer mock-token' },
        params: { limit: 20, offset: 0, country: 'US' }
      });
    });

    it('should fetch new releases with custom parameters', async () => {
      // Mock the access token
      jest.spyOn(spotifyService, 'getAccessToken').mockResolvedValue('mock-token');

      // Mock the response
      axios.mockResolvedValueOnce({
        data: { albums: { items: [] } }
      });

      await spotifyService.getNewReleases(10, 5, 'GB');

      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.spotify.com/v1/browse/new-releases',
        headers: { 'Authorization': 'Bearer mock-token' },
        params: { limit: 10, offset: 5, country: 'GB' }
      });
    });
  });

  describe('getAvailableGenres', () => {
    it('should fetch available genres', async () => {
      // Mock the access token
      jest.spyOn(spotifyService, 'getAccessToken').mockResolvedValue('mock-token');

      // Mock the response
      axios.mockResolvedValueOnce({
        data: { genres: [] }
      });

      await spotifyService.getAvailableGenres();

      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.spotify.com/v1/recommendations/available-genre-seeds',
        headers: { 'Authorization': 'Bearer mock-token' },
        params: {}
      });
    });
  });
});