const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const REVIEWS_FILE = path.join(__dirname, '../../reviews.json');

class ReviewsService {
  async initializeReviewsFile() {
    try {
      await fs.access(REVIEWS_FILE);
    } catch (error) {
      // File doesn't exist, create it
      await fs.writeFile(REVIEWS_FILE, JSON.stringify([]));
    }
  }

  async readReviews() {
    try {
      await this.initializeReviewsFile();
      const data = await fs.readFile(REVIEWS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Failed to read reviews file');
    }
  }

  async writeReviews(reviews) {
    try {
      await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
    } catch (error) {
      throw new Error('Failed to write reviews file');
    }
  }

  async createReview(audiobookId, rating, comment) {
    const reviews = await this.readReviews();
    
    const newReview = {
      reviewId: uuidv4(),
      audiobookId,
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    reviews.push(newReview);
    await this.writeReviews(reviews);
    
    return newReview;
  }

  async getReviewsByAudiobookId(audiobookId) {
    const reviews = await this.readReviews();
    const filteredReviews = reviews.filter(review => review.audiobookId === audiobookId);
    
    // Return newest first
    return filteredReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getAverageRating(audiobookId) {
    const reviews = await this.getReviewsByAudiobookId(audiobookId);
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal

    return {
      averageRating,
      totalReviews: reviews.length
    };
  }
}

module.exports = new ReviewsService();
