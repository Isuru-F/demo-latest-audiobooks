import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  getNewReleases(limit = 20, offset = 0, country = 'US') {
    return apiClient.get('/spotify/new-releases', {
      params: { limit, offset, country }
    });
  },
  getAvailableGenres() {
    return apiClient.get('/spotify/genres');
  },
  getAudiobooks(limit = 40, offset = 0, market = 'AU') {
    return apiClient.get('/spotify/audiobooks', {
      params: { limit, offset, market }
    });
  },
  // Review endpoints
  createReview(audiobookId: string, rating: number, comment: string) {
    return apiClient.post('/reviews', { audiobookId, rating, comment });
  },
  getReviews(audiobookId: string) {
    return apiClient.get(`/reviews/${audiobookId}`);
  },
  getAverageRating(audiobookId: string) {
    return apiClient.get(`/reviews/${audiobookId}/average`);
  }
};