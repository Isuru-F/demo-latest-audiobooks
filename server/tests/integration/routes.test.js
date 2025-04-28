const request = require('supertest');
const app = require('../../index');
const spotifyService = require('../../src/services/spotify.service');

jest.mock('../../src/services/spotify.service');

describe('Spotify API Routes', () => {
  describe('GET /api/spotify/audiobooks', () => {
    it('should return audiobooks data', async () => {
      // Mock the service response
      const mockAudiobooksData = {
        audiobooks: {
          items: [
            { id: '1', name: 'Audiobook 1', description: 'Description 1' },
            { id: '2', name: 'Audiobook 2', description: 'Description 2' }
          ]
        }
      };
      
      spotifyService.getAudiobooks.mockResolvedValue(mockAudiobooksData);
      
      const response = await request(app)
        .get('/api/spotify/audiobooks')
        .query({ limit: 40, market: 'AU' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAudiobooksData);
      expect(spotifyService.getAudiobooks).toHaveBeenCalledWith('40', 0, 'AU');
    });
    
    it('should handle API errors', async () => {
      // Mock service error
      spotifyService.getAudiobooks.mockRejectedValue(new Error('API error'));
      
      const response = await request(app).get('/api/spotify/audiobooks');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});