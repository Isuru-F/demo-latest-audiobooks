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
  }
};