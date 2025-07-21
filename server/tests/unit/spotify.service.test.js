const axios = require('axios');
const spotifyService = require('../../src/services/spotify.service');

jest.mock('axios');

describe('SpotifyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock token response
    axios.mockResolvedValueOnce({
      data: {
        access_token: 'test-access-token-' + Date.now(),
        expires_in: 3600
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
      expect(audiobooksCall.headers.Authorization).toMatch(/^Bearer test-access-token-\d+$/);
    });

    it('should throw an error when API call fails', async () => {
      // Replace axios mock to make the token request succeed but the audiobooks call fail
      axios.mockReset();
      axios.mockResolvedValueOnce({
        data: {
          access_token: 'test-access-token-' + Date.now(),
          expires_in: 3600
        }
      });
      axios.mockRejectedValueOnce(new Error('API error'));

      await expect(spotifyService.getAudiobooks()).rejects.toThrow('Failed to fetch audiobooks from Spotify');
    });
  });
});