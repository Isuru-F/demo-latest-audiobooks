<script setup lang="ts">
import { ref, computed } from 'vue'
import StarRating from './StarRating.vue'
import api from '@/services/api'
import type { Review } from '@/types/spotify'

interface Props {
  audiobookId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reviewSubmitted: [review: Review]
  error: [message: string]
}>()

const rating = ref(0)
const comment = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)

const remainingChars = computed(() => 500 - comment.value.length)
const isValid = computed(() => rating.value > 0 && comment.value.trim().length > 0 && comment.value.length <= 500)

const resetForm = () => {
  rating.value = 0
  comment.value = ''
  showSuccess.value = false
}

const submitReview = async () => {
  if (!isValid.value) return

  isSubmitting.value = true
  try {
    const response = await api.createReview(props.audiobookId, rating.value, comment.value.trim())
    emit('reviewSubmitted', response.data)
    showSuccess.value = true
    setTimeout(() => {
      resetForm()
    }, 2000)
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to submit review'
    emit('error', errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="review-form">
    <h3>Write a Review</h3>
    
    <div v-if="showSuccess" class="success-message">
      <div class="success-icon">✓</div>
      <p>Review submitted successfully!</p>
    </div>
    
    <form v-else @submit.prevent="submitReview" class="form">
      <div class="rating-section">
        <label>Your Rating *</label>
        <StarRating v-model="rating" size="large" />
        <p v-if="rating === 0" class="error-text">Please select a rating</p>
      </div>
      
      <div class="comment-section">
        <label for="comment">Your Review *</label>
        <textarea
          id="comment"
          v-model="comment"
          placeholder="Share your thoughts about this audiobook..."
          maxlength="500"
          rows="4"
          :class="{ 'error': comment.length > 500 }"
        ></textarea>
        <div class="char-count" :class="{ 'error': remainingChars < 0 }">
          {{ remainingChars }} characters remaining
        </div>
        <p v-if="comment.trim().length === 0 && rating > 0" class="error-text">
          Please write a review
        </p>
      </div>
      
      <button 
        type="submit" 
        class="submit-btn"
        :disabled="!isValid || isSubmitting"
      >
        <span v-if="isSubmitting" class="loading-spinner"></span>
        {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.review-form {
  background: #f8f9fc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e1e5e9;
}

.review-form h3 {
  margin: 0 0 20px;
  color: #2a2d3e;
  font-size: 20px;
  font-weight: 600;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #d4edda;
  color: #155724;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
}

.success-icon {
  background: #28a745;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rating-section label,
.comment-section label {
  display: block;
  margin-bottom: 8px;
  color: #2a2d3e;
  font-weight: 500;
}

.comment-section textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d7dc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s;
}

.comment-section textarea:focus {
  outline: none;
  border-color: #8a42ff;
  box-shadow: 0 0 0 2px rgba(138, 66, 255, 0.1);
}

.comment-section textarea.error {
  border-color: #dc3545;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.char-count.error {
  color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin: 4px 0 0;
}

.submit-btn {
  align-self: flex-start;
  padding: 12px 24px;
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(138, 66, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
