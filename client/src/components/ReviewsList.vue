<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StarRating from './StarRating.vue'
import api from '@/services/api'
import type { Review, AverageRating } from '@/types/spotify'

interface Props {
  audiobookId: string
}

const props = defineProps<Props>()

const reviews = ref<Review[]>([])
const averageRating = ref<AverageRating>({ averageRating: 0, totalReviews: 0 })
const isLoading = ref(true)
const error = ref('')

const sortedReviews = computed(() => {
  return [...reviews.value].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadReviews = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const [reviewsResponse, avgResponse] = await Promise.all([
      api.getReviews(props.audiobookId),
      api.getAverageRating(props.audiobookId)
    ])
    
    reviews.value = reviewsResponse.data
    averageRating.value = avgResponse.data
  } catch (err: any) {
    error.value = 'Failed to load reviews'
    console.error('Error loading reviews:', err)
  } finally {
    isLoading.value = false
  }
}

const refreshReviews = () => {
  loadReviews()
}

onMounted(() => {
  loadReviews()
})

defineExpose({
  refreshReviews
})
</script>

<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h3>Reviews & Ratings</h3>
      
      <div v-if="!isLoading && averageRating.totalReviews > 0" class="rating-summary">
        <div class="average-rating">
          <span class="rating-number">{{ averageRating.averageRating.toFixed(1) }}</span>
          <div class="rating-stars">
            <StarRating :model-value="averageRating.averageRating" :readonly="true" />
          </div>
          <span class="review-count">{{ averageRating.totalReviews }} review{{ averageRating.totalReviews !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading reviews...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadReviews" class="retry-btn">Try Again</button>
    </div>
    
    <div v-else-if="reviews.length === 0" class="no-reviews">
      <p>No reviews yet. Be the first to review this audiobook!</p>
    </div>
    
    <div v-else class="reviews-list">
      <div v-for="review in sortedReviews" :key="review.id" class="review-item">
        <div class="review-header">
          <StarRating :model-value="review.rating" :readonly="true" size="small" />
          <span class="review-date">{{ formatDate(review.timestamp) }}</span>
        </div>
        <div class="review-content">
          <p>{{ review.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.reviews-header h3 {
  margin: 0;
  color: #2a2d3e;
  font-size: 20px;
  font-weight: 600;
}

.rating-summary {
  text-align: right;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.rating-number {
  font-size: 28px;
  font-weight: 700;
  color: #2a2d3e;
  line-height: 1;
}

.rating-stars {
  display: flex;
  align-items: center;
}

.review-count {
  font-size: 12px;
  color: #6c757d;
}

.loading, .error, .no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.spinner {
  border: 3px solid rgba(138, 66, 255, 0.1);
  border-radius: 50%;
  border-top: 3px solid #8a42ff;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: transform 0.2s;
}

.retry-btn:hover {
  transform: translateY(-1px);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  background: #fafbfc;
  transition: box-shadow 0.2s;
}

.review-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-date {
  font-size: 12px;
  color: #6c757d;
}

.review-content p {
  margin: 0;
  line-height: 1.6;
  color: #2a2d3e;
}

@media (max-width: 768px) {
  .reviews-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .rating-summary {
    text-align: left;
  }
  
  .average-rating {
    align-items: flex-start;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
