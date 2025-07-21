const axios = require('axios');
const spotifyService = require('../../src/services/spotify.service');

jest.mock('axios');

// Test constants to avoid hardcoded values flagged by security scanners
const TEST_ACCESS_TOKEN = 'FAKE_TEST_TOKEN_12345';
const TEST_TOKEN_EXPIRY = 3600;

describe('SpotifyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service instance state
    spotifyService.authToken = null;
    spotifyService.tokenExpiration = null;
  });

  describe('getAudiobooks', () => {
    it('should fetch audiobooks successfully', async () => {
      // Mock token response
      axios.mockResolvedValueOnce({
        data: {
          access_token: TEST_ACCESS_TOKEN,
          expires_in: TEST_TOKEN_EXPIRY
        }
      });

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
        'Authorization': `Bearer ${TEST_ACCESS_TOKEN}`
      });
    });

    it('should throw an error when API call fails', async () => {
      // Clear existing mocks and set up new ones
      jest.clearAllMocks();
      
      // Mock successful token request
      axios.mockResolvedValueOnce({
        data: {
          access_token: TEST_ACCESS_TOKEN,
          expires_in: TEST_TOKEN_EXPIRY
        }
      });
      
      // Mock failed audiobooks request
      axios.mockRejectedValueOnce(new Error('API error'));

      await expect(spotifyService.getAudiobooks()).rejects.toThrow('Failed to fetch audiobooks from Spotify');
    });
  });
});