const axios = require('axios');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.baseUrl = 'https://api.spotify.com/v1';
    this.authToken = null;
    this.tokenExpiration = null;
  }

  async getToken() {
    // Return existing token if it's still valid
    if (this.authToken && this.tokenExpiration > Date.now()) {
      return this.authToken;
    }

    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          grant_type: 'client_credentials'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')
        }
      });

      this.authToken = response.data.access_token;
      // Set expiration time (token expires in 3600 seconds)
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
      
      return this.authToken;
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  async getNewReleases(limit = 20, offset = 0, country = 'US') {
    try {
      const token = await this.getToken();
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/browse/new-releases`,
        params: { limit, offset, country },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching new releases:', error);
      throw new Error('Failed to fetch new releases from Spotify');
    }
  }

  async getGenres() {
    try {
      const token = await this.getToken();
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/recommendations/available-genre-seeds`,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { genres: response.data.genres };
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw new Error('Failed to fetch genres from Spotify');
    }
  }

  async getAudiobooks(limit = 40, offset = 0, market = 'AU', query = 'tag:new') {
    try {
      const token = await this.getToken();
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/search`,
        params: {
          q: query,
          type: 'audiobook',
          market,
          limit,
          offset
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching audiobooks:', error);
      throw new Error('Failed to fetch audiobooks from Spotify');
    }
  }
}

module.exports = new SpotifyService();