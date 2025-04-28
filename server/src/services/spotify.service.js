const axios = require('axios');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.baseUrl = 'https://api.spotify.com/v1';
  }

  async getAccessToken() {
    // Return existing token if it's still valid
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const tokenResponse = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        data: 'grant_type=client_credentials'
      });

      this.accessToken = tokenResponse.data.access_token;
      // Set expiry time (token is valid for 3600 seconds)
      this.tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error.message);
      throw new Error('Failed to get Spotify access token');
    }
  }

  async request(endpoint, method = 'GET', params = {}) {
    try {
      const token = await this.getAccessToken();
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error(`Error making Spotify API request to ${endpoint}:`, error.message);
      throw error;
    }
  }

  async getNewReleases(limit = 20, offset = 0, country = 'US') {
    return this.request('/browse/new-releases', 'GET', { limit, offset, country });
  }

  async getAvailableGenres() {
    return this.request('/recommendations/available-genre-seeds');
  }
}

module.exports = new SpotifyService();