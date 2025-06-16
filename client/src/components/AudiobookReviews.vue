<script setup lang="ts">
import { ref } from 'vue'
import ReviewForm from './ReviewForm.vue'
import ReviewsList from './ReviewsList.vue'
import type { Review } from '@/types/spotify'

interface Props {
  audiobookId: string
}

const props = defineProps<Props>()

const reviewsListRef = ref<InstanceType<typeof ReviewsList>>()
const errorMessage = ref('')
const showError = ref(false)

const handleReviewSubmitted = (review: Review) => {
  // Refresh the reviews list
  reviewsListRef.value?.refreshReviews()
  hideError()
}

const handleError = (message: string) => {
  errorMessage.value = message
  showError.value = true
  setTimeout(() => {
    hideError()
  }, 5000)
}

const hideError = () => {
  showError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div class="audiobook-reviews">
    <div v-if="showError" class="error-banner">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span>{{ errorMessage }}</span>
        <button @click="hideError" class="close-error">✕</button>
      </div>
    </div>
    
    <ReviewForm 
      :audiobook-id="audiobookId"
      @review-submitted="handleReviewSubmitted"
      @error="handleError"
    />
    
    <ReviewsList 
      ref="reviewsListRef"
      :audiobook-id="audiobookId"
    />
  </div>
</template>

<style scoped>
.audiobook-reviews {
  max-width: 800px;
  margin: 0 auto;
}

.error-banner {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #721c24;
}

.error-icon {
  font-size: 16px;
}

.close-error {
  background: none;
  border: none;
  color: #721c24;
  cursor: pointer;
  font-size: 14px;
  margin-left: auto;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.close-error:hover {
  background-color: rgba(114, 28, 36, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
