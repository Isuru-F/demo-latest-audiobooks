<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSpotifyStore } from '@/stores/spotify';
import AudiobookCard from '@/components/AudiobookCard.vue';
import type { NarratorObject } from '@/types/spotify';

const spotifyStore = useSpotifyStore();
const searchQuery = ref('');
const multiCastOnly = ref(false);

// Helper function to check if a narrator matches the search query
const isNarratorMatch = (narrator: string | NarratorObject, query: string): boolean => {
  if (typeof narrator === 'string') {
    return narrator.toLowerCase().includes(query);
  } else if (narrator && typeof narrator === 'object') {
    return narrator.name ? narrator.name.toLowerCase().includes(query) : false;
  }
  return false;
};

const filteredAudiobooks = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const hasQuery = query.length > 0;
  
  // Combined filter in one pass for better performance
  return spotifyStore.audiobooks.filter(audiobook => {
    // Multi-cast filter check
    if (multiCastOnly.value && (!audiobook.narrators || audiobook.narrators.length <= 1)) {
      return false;
    }
    
    // If no search query, just return the audiobook (might be filtered by multi-cast)
    if (!hasQuery) {
      return true;
    }
    
    // Search by audiobook name
    if (audiobook.name.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search by author name
    const authorMatch = audiobook.authors.some(author => 
      author.name.toLowerCase().includes(query)
    );
    
    // Search by narrator
    const narratorMatch = audiobook.narrators?.some(narrator => 
      isNarratorMatch(narrator, query)
    );
    
    return authorMatch || narratorMatch;
  });
});

// Toggle multi-cast filter
const toggleMultiCast = () => {
  multiCastOnly.value = !multiCastOnly.value;
};

onMounted(() => {
  spotifyStore.fetchAudiobooks();
});
</script>

<template>
  <main>

    <section class="audiobooks">
      <div class="audiobooks-header">
        <h2>Latest Audiobooks via Spotify API</h2>
        <div class="search-controls">
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search titles, authors or narrators..." 
              class="search-input"
            />
          </div>
          <button 
            @click="toggleMultiCast" 
            class="multi-cast-toggle" 
            :class="{ active: multiCastOnly }"
            :aria-pressed="multiCastOnly"
            aria-label="Filter for multi-cast audiobooks only"
          >
            Multi-Cast Only
          </button>
        </div>
      </div>
      
      <div v-if="spotifyStore.isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading audiobooks...</p>
      </div>
      <div v-else-if="spotifyStore.error" class="error">
        <p>{{ spotifyStore.error }}</p>
        <button @click="spotifyStore.fetchAudiobooks()">Try Again</button>
      </div>
      <div v-else>
        <p v-if="filteredAudiobooks.length === 0" class="no-results">No audiobooks match your search.</p>
        <div v-else class="audiobook-grid">
          <AudiobookCard 
            v-for="audiobook in filteredAudiobooks" 
            :key="audiobook.id" 
            :audiobook="audiobook" 
          />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
:root {
  --primary-color: #8a42ff;
  --secondary-color: #e942ff;
  --primary-gradient: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
  --text-color: #2a2d3e;
  --light-bg: #f0f2fa;
  --lighter-bg: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.05);
  --primary-shadow: rgba(138, 66, 255, 0.2);
  --error-color: #e53935;
}

.hero {
  background: var(--primary-gradient);
  padding: 80px 20px;
  text-align: center;
  color: white;
  margin-bottom: 40px;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 10px 30px var(--primary-shadow);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.audiobooks {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.audiobooks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.audiobooks h2 {
  font-size: 32px;
  color: var(--text-color);
  position: relative;
  display: inline-block;
  margin: 0;
}

.audiobooks h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 4px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

.search-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 30px;
  background: var(--light-bg);
  color: var(--text-color);
  font-size: 16px;
  box-shadow: 0 4px 10px var(--shadow-color);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 15px var(--primary-shadow);
  background: var(--lighter-bg);
}

.multi-cast-toggle {
  padding: 10px 20px;
  background: var(--light-bg);
  color: var(--text-color);
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px var(--shadow-color);
}

.multi-cast-toggle:hover {
  background: #e6e8f5;
  transform: translateY(-2px);
}

.multi-cast-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-shadow);
}

.multi-cast-toggle.active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 15px var(--primary-shadow);
}

.audiobook-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

@media (min-width: 1200px) {
  .audiobook-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #8a8c99;
  font-size: 18px;
}

.loading, .error {
  text-align: center;
  padding: 40px 0;
}

.spinner {
  border: 4px solid rgba(138, 66, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
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
  color: var(--error-color);
  margin-bottom: 20px;
}

.error button {
  padding: 10px 20px;
  background: var(--primary-gradient);
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

.error button:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-shadow);
}
</style>