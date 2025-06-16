const fs = require('fs').promises;
const path = require('path');

class ReviewService {
  constructor() {
    this.reviewsFile = path.join(__dirname, '../../reviews.json');
  }

  async readReviews() {
    try {
      const data = await fs.readFile(this.reviewsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeReviews(reviews) {
    await fs.writeFile(this.reviewsFile, JSON.stringify(reviews, null, 2));
  }

  async addReview(reviewData) {
    const reviews = await this.readReviews();
    const newReview = {
      id: Date.now().toString(),
      audiobookId: reviewData.audiobookId,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      timestamp: new Date().toISOString()
    };
    
    reviews.push(newReview);
    await this.writeReviews(reviews);
    return newReview;
  }

  async getReviewsByAudiobookId(audiobookId) {
    const reviews = await this.readReviews();
    return reviews.filter(review => review.audiobookId === audiobookId);
  }

  async getAverageRating(audiobookId) {
    const reviews = await this.getReviewsByAudiobookId(audiobookId);
    
    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count: reviews.length
    };
  }
}

module.exports = new ReviewService();
