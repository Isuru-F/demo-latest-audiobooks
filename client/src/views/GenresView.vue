<script setup lang="ts">
import { onMounted } from 'vue';
import { useSpotifyStore } from '@/stores/spotify';
import GenreButton from '@/components/GenreButton.vue';

const spotifyStore = useSpotifyStore();

onMounted(() => {
  spotifyStore.fetchGenres();
});
</script>

<template>
  <main>
    <section class="genres-header">
      <h1>Explore Genres</h1>
      <p>Discover music across different genres and styles</p>
    </section>

    <section class="genres-content">
      <div v-if="spotifyStore.isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading genres...</p>
      </div>
      <div v-else-if="spotifyStore.error" class="error">
        <p>{{ spotifyStore.error }}</p>
        <button @click="spotifyStore.fetchGenres()">Try Again</button>
      </div>
      <div v-else class="genres-grid">
        <GenreButton 
          v-for="genre in spotifyStore.genres" 
          :key="genre" 
          :genre="genre" 
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.genres-header {
  background: linear-gradient(135deg, #42b0ff, #4287ff);
  padding: 60px 20px;
  text-align: center;
  color: white;
  margin-bottom: 40px;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 10px 30px rgba(66, 135, 255, 0.3);
}

.genres-header h1 {
  font-size: 42px;
  margin-bottom: 15px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.genres-header p {
  font-size: 18px;
  opacity: 0.9;
}

.genres-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto 60px;
}

.genres-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.loading, .error {
  text-align: center;
  padding: 40px 0;
}

.spinner {
  border: 4px solid rgba(66, 135, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4287ff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error p {
  color: #e53935;
  margin-bottom: 20px;
}

.error button {
  padding: 10px 20px;
  background: linear-gradient(90deg, #42b0ff, #4287ff);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s;
}

.error button:hover {
  transform: translateY(-2px);
}
</style>