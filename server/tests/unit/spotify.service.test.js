const axios = require('axios');
const spotifyService = require('../../src/services/spotify.service');

jest.mock('axios');

describe('SpotifyService', () => {
  // Helper function to generate mock tokens dynamically to avoid hardcoded secrets
  const createMockToken = () => `test-${Date.now()}-mock-token`;
  const MOCK_TOKEN_EXPIRY = 3600;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service instance state
    spotifyService.authToken = null;
    spotifyService.tokenExpiration = null;
  });

  describe('getAudiobooks', () => {
    it('should fetch audiobooks successfully', async () => {
      const mockToken = createMockToken();
      
      // Mock token response
      axios.mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          expires_in: MOCK_TOKEN_EXPIRY
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
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('should throw an error when API call fails', async () => {
      // Clear existing mocks and set up new ones
      jest.clearAllMocks();
      
      const mockToken = createMockToken();
      
      // Mock successful token request
      axios.mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          expires_in: MOCK_TOKEN_EXPIRY
        }
      });
      
      // Mock failed audiobooks request
      axios.mockRejectedValueOnce(new Error('API error'));

      await expect(spotifyService.getAudiobooks()).rejects.toThrow('Failed to fetch audiobooks from Spotify');
    });
  });

  describe('Security Tests', () => {
    it('should not contain any hardcoded secrets in test values', () => {
      const testToken = createMockToken();
      
      // Verify our mock values are clearly test values and not real secrets
      expect(testToken).toMatch(/^test-.*-mock-token$/);
      expect(testToken.length).toBeLessThan(50); // Real tokens are typically longer
      expect(testToken).not.toMatch(/^[A-Za-z0-9+/]{40,}={0,2}$/); // Not base64 encoded like real tokens
    });

    it('should use environment variables for real credentials', () => {
      // Verify the service properly uses environment variables
      expect(spotifyService.clientId).toBe(process.env.SPOTIFY_CLIENT_ID);
      expect(spotifyService.clientSecret).toBe(process.env.SPOTIFY_CLIENT_SECRET);
    });

    it('should never expose real credentials in test code', () => {
      // Ensure no environment variables contain hardcoded secrets in this test file
      const fileContent = require('fs').readFileSync(__filename, 'utf8');
      
      // These patterns should NOT be found in test files
      const dangerousPatterns = [
        /sk_[a-zA-Z0-9]{48}/, // Stripe keys
        /pk_[a-zA-Z0-9]{24}/, // Public API keys
        /[a-zA-Z0-9]{32,}/, // Long alphanumeric strings that could be tokens
        /Bearer [a-zA-Z0-9+/]{20,}/, // Bearer tokens
      ];

      dangerousPatterns.forEach(pattern => {
        const matches = fileContent.match(pattern);
        if (matches) {
          // Allow our mock token pattern but not others
          const allowedMatches = matches.filter(match => 
            match.includes('test-') && match.includes('mock-token')
          );
          expect(allowedMatches.length).toBe(matches.length);
        }
      });
    });
  });
});
