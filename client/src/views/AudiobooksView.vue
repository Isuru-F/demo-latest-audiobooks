<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSpotifyStore } from '@/stores/spotify';
import AudiobookCard from '@/components/AudiobookCard.vue';

const spotifyStore = useSpotifyStore();
const searchQuery = ref('');
const multiCastOnly = ref(false);

const isMultiCast = (audiobook: any) => {
  return audiobook.narrators && audiobook.narrators.length > 1;
};

const filteredAudiobooks = computed(() => {
  let books = spotifyStore.audiobooks;
  
  // Apply multi-cast filter first
  if (multiCastOnly.value) {
    books = books.filter(isMultiCast);
  }
  
  // Apply search filter
  if (!searchQuery.value.trim()) {
    return books;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  return books.filter(audiobook => {
    // Search by audiobook name
    if (audiobook.name.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search by author name
    const authorMatch = audiobook.authors.some(author => 
      author.name.toLowerCase().includes(query)
    );
    
    // Search by narrator
    const narratorMatch = audiobook.narrators?.some(narrator => {
      if (typeof narrator === 'string') {
        return narrator.toLowerCase().includes(query);
      } else if (narrator && typeof narrator === 'object') {
        return narrator.name ? narrator.name.toLowerCase().includes(query) : false;
      }
      return false;
    });
    
    return authorMatch || narratorMatch;
  });
});

const noResultsMessage = computed(() => {
  if (multiCastOnly.value && searchQuery.value.trim()) {
    return 'No multi-cast audiobooks match your search criteria.';
  } else if (multiCastOnly.value) {
    return 'No multi-cast audiobooks found.';
  } else if (searchQuery.value.trim()) {
    return 'No audiobooks match your search.';
  }
  return 'No audiobooks found.';
});

onMounted(() => {
  spotifyStore.fetchAudiobooks();
});
</script>

<template>
  <main>

    <section class="audiobooks">
      <div class="audiobooks-header">
        <h2>Latest Audiobooks via Spotify API</h2>
        <div class="controls-container">
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search titles, authors or narrators..." 
              class="search-input"
            />
          </div>
          <div class="toggle-container">
            <label class="toggle-switch" :class="{ active: multiCastOnly }">
              <input 
                type="checkbox" 
                v-model="multiCastOnly"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-label">Multi-Cast Only</span>
            </label>
          </div>
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
        <p v-if="filteredAudiobooks.length === 0" class="no-results">{{ noResultsMessage }}</p>
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
.hero {
  background: linear-gradient(135deg, #8a42ff, #e942ff);
  padding: 80px 20px;
  text-align: center;
  color: white;
  margin-bottom: 40px;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 10px 30px rgba(138, 66, 255, 0.3);
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

.controls-container {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.audiobooks h2 {
  font-size: 32px;
  color: #2a2d3e;
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
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  border-radius: 2px;
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
  background: #f0f2fa;
  color: #2a2d3e;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 15px rgba(138, 66, 255, 0.2);
  background: #ffffff;
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  font-weight: 500;
  color: #2a2d3e;
  transition: color 0.3s ease;
}

.toggle-switch.active {
  color: #8a42ff;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 24px;
  background: #e0e4f0;
  border-radius: 24px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(90deg, #e942ff, #8a42ff);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-label {
  font-weight: 500;
  white-space: nowrap;
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
  border-top: 4px solid #8a42ff;
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
  background: linear-gradient(90deg, #e942ff, #8a42ff);
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