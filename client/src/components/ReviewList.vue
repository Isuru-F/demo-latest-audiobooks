<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StarRating from './StarRating.vue'
import api from '@/services/api'

interface Review {
  id: string
  audiobookId: string
  rating: number
  comment: string | null
  timestamp: string
}

interface AverageRating {
  average: number
  count: number
}

interface Props {
  audiobookId: string
}

const props = defineProps<Props>()

const reviews = ref<Review[]>([])
const averageRating = ref<AverageRating>({ average: 0, count: 0 })
const loading = ref(false)
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
  loading.value = true
  error.value = ''
  
  try {
    const [reviewsResponse, averageResponse] = await Promise.all([
      api.getReviews(props.audiobookId),
      api.getAverageRating(props.audiobookId)
    ])
    
    reviews.value = reviewsResponse.data
    averageRating.value = averageResponse.data
  } catch (err: any) {
    error.value = 'Failed to load reviews'
    console.error('Error loading reviews:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadReviews)

defineExpose({
  loadReviews
})
</script>

<template>
  <div class="review-list">
    <div class="average-rating" v-if="averageRating.count > 0">
      <div class="average-display">
        <StarRating :rating="averageRating.average" size="large" />
        <span class="average-text">
          {{ averageRating.average.toFixed(1) }} out of 5 stars
        </span>
        <span class="review-count">
          ({{ averageRating.count }} {{ averageRating.count === 1 ? 'review' : 'reviews' }})
        </span>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading reviews...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="reviews.length === 0" class="no-reviews">
      No reviews yet. Be the first to review this audiobook!
    </div>
    <div v-else class="reviews">
      <h3>Reviews</h3>
      <div 
        v-for="review in sortedReviews" 
        :key="review.id"
        class="review-item"
      >
        <div class="review-header">
          <StarRating :rating="review.rating" size="small" />
          <span class="review-date">{{ formatDate(review.timestamp) }}</span>
        </div>
        <div v-if="review.comment" class="review-comment">
          {{ review.comment }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-list {
  background: #3a3d4e;
  border-radius: 12px;
  padding: 24px;
}

.average-rating {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #4a4d5e;
}

.average-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.average-text {
  color: #f5f6fa;
  font-size: 18px;
  font-weight: 600;
}

.review-count {
  color: #8a8c99;
  font-size: 14px;
}

.loading, .error, .no-reviews {
  text-align: center;
  padding: 40px;
  color: #8a8c99;
  font-size: 16px;
}

.error {
  color: #ff6b6b;
}

.reviews h3 {
  margin: 0 0 20px;
  color: #f5f6fa;
  font-size: 18px;
  font-weight: 600;
}

.review-item {
  background: #2a2d3e;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #4a4d5e;
}

.review-item:last-child {
  margin-bottom: 0;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.review-date {
  color: #8a8c99;
  font-size: 12px;
}

.review-comment {
  color: #b2b5c4;
  line-height: 1.6;
  font-size: 14px;
}
</style>
