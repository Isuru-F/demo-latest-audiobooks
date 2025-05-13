<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const toggleFilter = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <div 
    class="multi-cast-toggle" 
    :class="{ 'active': modelValue }" 
    @click="toggleFilter"
  >
    <div class="toggle-switch">
      <div class="toggle-handle"></div>
    </div>
    <span class="toggle-label">Multi-Cast Only</span>
  </div>
</template>

<style scoped>
.multi-cast-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  background: #f0f2fa;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  user-select: none;
  margin-right: 10px;
}

.multi-cast-toggle:hover {
  box-shadow: 0 4px 15px rgba(138, 66, 255, 0.1);
}

.multi-cast-toggle.active {
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  color: white;
}

.toggle-switch {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 10px;
  background-color: #dde1f0;
  margin-right: 8px;
  transition: background-color 0.3s;
}

.active .toggle-switch {
  background-color: rgba(255, 255, 255, 0.3);
}

.toggle-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: white;
  transition: transform 0.3s ease;
}

.active .toggle-handle {
  transform: translateX(16px);
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
}
</style>