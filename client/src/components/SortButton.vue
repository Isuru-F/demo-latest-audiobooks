<script setup lang="ts">
export interface SortOption {
  label: string
  value: string
}

interface Props {
  options: SortOption[]
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Sort by...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="sort-button">
    <select 
      :value="modelValue" 
      @change="handleChange"
      class="sort-select"
      aria-label="Sort options"
    >
      <option value="">{{ placeholder }}</option>
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.sort-button {
  position: relative;
  width: 200px;
}

.sort-select {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 30px;
  background: #f0f2fa;
  color: #2a2d3e;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232a2d3e' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 40px;
}

.sort-select:focus {
  outline: none;
  box-shadow: 0 4px 15px rgba(138, 66, 255, 0.2);
  background-color: #ffffff;
}

.sort-select:hover {
  background-color: #ffffff;
}

.sort-select option {
  padding: 10px;
  background: #ffffff;
  color: #2a2d3e;
}

@media (max-width: 768px) {
  .sort-button {
    width: 100%;
  }
}
</style>
