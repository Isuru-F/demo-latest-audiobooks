<script setup lang="ts">
defineProps<{
  genre: string
}>();
</script>

<template>
  <button class="genre-button">
    {{ genre }}
  </button>
</template>

<style scoped>
.genre-button {
  padding: 10px 20px;
  margin: 8px;
  background: linear-gradient(135deg, #3a3d4e, #2a2d3e);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-transform: capitalize;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.genre-button:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #4a4d5e, #3a3d4e);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.genre-button:active {
  transform: translateY(1px);
}
</style>