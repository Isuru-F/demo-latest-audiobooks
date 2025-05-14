<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label: string;
  id?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const toggleId = props.id || `toggle-${Math.random().toString(36).substring(2, 9)}`;

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

<template>
  <div class="toggle-container">
    <label :for="toggleId" class="toggle-switch">
      <input 
        type="checkbox" 
        :id="toggleId"
        :checked="modelValue" 
        @change="updateValue"
        :aria-label="label"
      >
      <span class="toggle-slider" aria-hidden="true"></span>
      <span class="toggle-label">{{ label }}</span>
    </label>
  </div>
</template>

<style scoped>
.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch input:focus-visible + .toggle-slider {
  outline: 2px solid #8a42ff;
  outline-offset: 2px;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  background-color: #f0f2fa;
  border-radius: 24px;
  transition: .4s;
  margin-right: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(90deg, #e942ff, #8a42ff);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.toggle-label {
  font-size: 14px;
  color: #2a2d3e;
  font-weight: 500;
}

.toggle-switch input:checked ~ .toggle-label {
  color: #8a42ff;
}
</style>