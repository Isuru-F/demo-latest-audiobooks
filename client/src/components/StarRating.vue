<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  size: 'medium'
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoveredStar = ref(0)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-sm'
    case 'large':
      return 'text-2xl'
    default:
      return 'text-xl'
  }
})

const handleClick = (rating: number) => {
  if (!props.readonly) {
    emit('update:modelValue', rating)
  }
}

const handleMouseEnter = (rating: number) => {
  if (!props.readonly) {
    hoveredStar.value = rating
  }
}

const handleMouseLeave = () => {
  if (!props.readonly) {
    hoveredStar.value = 0
  }
}

const getStarClass = (starIndex: number) => {
  const displayRating = props.readonly ? props.modelValue : (hoveredStar.value || props.modelValue)
  return starIndex <= displayRating ? 'star-filled' : 'star-empty'
}
</script>

<template>
  <div class="star-rating" :class="{ 'readonly': readonly }">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      class="star"
      :class="[getStarClass(star), sizeClasses]"
      :disabled="readonly"
      @click="handleClick(star)"
      @mouseenter="handleMouseEnter(star)"
      @mouseleave="handleMouseLeave"
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
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  line-height: 1;
}

.star:disabled {
  cursor: default;
}

.star-filled {
  color: #ffc107;
  text-shadow: 0 0 2px rgba(255, 193, 7, 0.3);
}

.star-empty {
  color: #e0e4e7;
}

.star:not(:disabled):hover {
  transform: scale(1.1);
}

.readonly .star {
  cursor: default;
}
</style>
