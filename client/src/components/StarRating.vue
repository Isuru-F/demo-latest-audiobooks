<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  rating: number
  maxRating?: number
  interactive?: boolean
  size?: 'small' | 'medium' | 'large'
}

interface Emits {
  (e: 'update:rating', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  maxRating: 5,
  interactive: false,
  size: 'medium'
})

const emit = defineEmits<Emits>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-sm'
    case 'large':
      return 'text-xl'
    default:
      return 'text-base'
  }
})

const handleStarClick = (rating: number) => {
  if (props.interactive) {
    emit('update:rating', rating)
  }
}

const stars = computed(() => {
  return Array.from({ length: props.maxRating }, (_, index) => {
    const starValue = index + 1
    return {
      value: starValue,
      filled: starValue <= props.rating,
      halfFilled: starValue - 0.5 === props.rating
    }
  })
})
</script>

<template>
  <div class="star-rating" :class="[sizeClasses, { interactive }]">
    <button
      v-for="star in stars"
      :key="star.value"
      type="button"
      :class="[
        'star',
        {
          'star-filled': star.filled,
          'star-half': star.halfFilled,
          'star-empty': !star.filled && !star.halfFilled
        }
      ]"
      :disabled="!interactive"
      @click="handleStarClick(star.value)"
    >
      ★
    </button>
  </div>
</template>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 2px;
}

.star {
  background: none;
  border: none;
  color: #4a5568;
  cursor: default;
  font-size: inherit;
  padding: 0;
  transition: color 0.2s;
}

.interactive .star {
  cursor: pointer;
}

.interactive .star:hover {
  color: #fbbf24;
}

.star-filled {
  color: #fbbf24;
}

.star-half {
  color: #fbbf24;
}

.star-empty {
  color: #4a5568;
}

.text-sm .star {
  font-size: 0.875rem;
}

.text-base .star {
  font-size: 1rem;
}

.text-xl .star {
  font-size: 1.25rem;
}
</style>
