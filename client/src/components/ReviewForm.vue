<script setup lang="ts">
import { ref } from 'vue'
import StarRating from './StarRating.vue'
import api from '@/services/api'

interface Props {
  audiobookId: string
}

interface Emits {
  (e: 'review-submitted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const rating = ref(0)
const comment = ref('')
const isSubmitting = ref(false)
const error = ref('')
const success = ref(false)

const submitReview = async () => {
  if (rating.value === 0) {
    error.value = 'Please select a rating'
    return
  }

  if (comment.value.length > 500) {
    error.value = 'Comment must be 500 characters or less'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    await api.submitReview({
      audiobookId: props.audiobookId,
      rating: rating.value,
      comment: comment.value.trim() || undefined
    })
    
    success.value = true
    rating.value = 0
    comment.value = ''
    
    setTimeout(() => {
      success.value = false
      emit('review-submitted')
    }, 2000)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to submit review'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="review-form">
    <h3>Rate this audiobook</h3>
    
    <div class="rating-section">
      <label>Your Rating:</label>
      <StarRating 
        :rating="rating" 
        :interactive="true" 
        size="large"
        @update:rating="rating = $event" 
      />
    </div>

    <div class="comment-section">
      <label for="comment">Your Review (optional):</label>
      <textarea
        id="comment"
        v-model="comment"
        placeholder="Share your thoughts about this audiobook..."
        maxlength="500"
        rows="4"
      ></textarea>
      <div class="character-count">{{ comment.length }}/500 characters</div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">Review submitted successfully!</div>

    <button 
      @click="submitReview"
      :disabled="isSubmitting || rating === 0"
      class="submit-btn"
    >
      {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
    </button>
  </div>
</template>

<style scoped>
.review-form {
  background: #3a3d4e;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.review-form h3 {
  margin: 0 0 20px;
  color: #f5f6fa;
  font-size: 18px;
  font-weight: 600;
}

.rating-section {
  margin-bottom: 20px;
}

.rating-section label {
  display: block;
  margin-bottom: 8px;
  color: #b2b5c4;
  font-weight: 500;
}

.comment-section {
  margin-bottom: 20px;
}

.comment-section label {
  display: block;
  margin-bottom: 8px;
  color: #b2b5c4;
  font-weight: 500;
}

textarea {
  width: 100%;
  background: #2a2d3e;
  border: 1px solid #4a4d5e;
  border-radius: 8px;
  padding: 12px;
  color: #f5f6fa;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: #8a42ff;
  box-shadow: 0 0 0 2px rgba(138, 66, 255, 0.2);
}

textarea::placeholder {
  color: #8a8c99;
}

.character-count {
  text-align: right;
  font-size: 12px;
  color: #8a8c99;
  margin-top: 4px;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 8px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
}

.success-message {
  color: #51cf66;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 8px;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 6px;
}

.submit-btn {
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(138, 66, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
