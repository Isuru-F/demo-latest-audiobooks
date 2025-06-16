const axios = require('axios');
const spotifyService = require('../../src/services/spotify.service');

jest.mock('axios');

// Test constants - clearly marked as mock values for testing only
// These are NOT real secrets and are safe to use in tests
const MOCK_ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN || 'test-access-token-not-real';
const MOCK_EXPIRES_IN = 3600;

describe('SpotifyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear token cache
    spotifyService.authToken = null;
    spotifyService.tokenExpiration = null;
    // Mock token response
    axios.mockResolvedValueOnce({
      data: {
        access_token: MOCK_ACCESS_TOKEN,
        expires_in: MOCK_EXPIRES_IN
      }
    });
  });

  describe('getAudiobooks', () => {
    it('should fetch audiobooks successfully', async () => {
      // Mock audiobooks response
      const mockAudiobooksData = {
        audiobooks: {
          items: [
            { id: '1', name: 'Audiobook 1' },
            { id: '2', name: 'Audiobook 2' }
          ]
        }
      };

      // Set up axios mock for the second call
      axios.mockResolvedValueOnce({
        data: mockAudiobooksData
      });

      const result = await spotifyService.getAudiobooks();
      
      expect(result).toEqual(mockAudiobooksData);
      expect(axios).toHaveBeenCalledTimes(2);
      
      // Verify the search parameters
      const audiobooksCall = axios.mock.calls[1][0];
      expect(audiobooksCall.url).toBe('https://api.spotify.com/v1/search');
      expect(audiobooksCall.params).toEqual({
        q: 'tag:new',
        type: 'audiobook',
        market: 'AU',
        limit: 40,
        offset: 0
      });
      expect(audiobooksCall.headers).toEqual({
        'Authorization': `Bearer ${MOCK_ACCESS_TOKEN}`
      });
    });

    it('should throw an error when API call fails', async () => {
      // Clear token cache and mock fresh calls
      spotifyService.authToken = null;
      spotifyService.tokenExpiration = null;
      axios.mockReset();
      
      // Mock successful getToken() call first, then make the audiobooks API call fail
      axios.mockResolvedValueOnce({
        data: {
          access_token: MOCK_ACCESS_TOKEN,
          expires_in: MOCK_EXPIRES_IN
        }
      });
      axios.mockRejectedValueOnce(new Error('API error'));

      await expect(spotifyService.getAudiobooks()).rejects.toThrow('Failed to fetch audiobooks from Spotify');
    });
  });
});