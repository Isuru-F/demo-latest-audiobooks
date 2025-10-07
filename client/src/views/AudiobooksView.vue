<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSpotifyStore } from '@/stores/spotify';
import AudiobookCard from '@/components/AudiobookCard.vue';

const spotifyStore = useSpotifyStore();
const searchQuery = ref('');

const multiCastOnly = ref(
  localStorage.getItem('multiCastOnly') === 'true'
);

const isMultiCast = (audiobook: any): boolean => {
  return audiobook.narrators && audiobook.narrators.length > 1;
};

const toggleMultiCast = () => {
  multiCastOnly.value = !multiCastOnly.value;
  localStorage.setItem('multiCastOnly', String(multiCastOnly.value));
};

const filteredAudiobooks = computed(() => {
  let results = spotifyStore.audiobooks;

  if (multiCastOnly.value) {
    results = results.filter(isMultiCast);
  }

  if (!searchQuery.value.trim()) {
    return results;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  return results.filter(audiobook => {
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
          <button 
            @click="toggleMultiCast"
            :class="['multi-cast-toggle', { active: multiCastOnly }]"
            :aria-pressed="multiCastOnly"
            aria-label="Filter multi-cast audiobooks only"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C7.33 12 2 13.34 2 16V18H10V16C10 14.67 9.67 13.47 9.09 12.45C9.39 12.17 9.68 11.89 10 11.63C11.14 12.5 13 13 15 13C17.67 13 20 14.34 20 17V18H12V16C12 14 11.33 12.33 10 11ZM15 10C17.21 10 19 8.21 19 6C19 3.79 17.21 2 15 2C14.53 2 14.09 2.1 13.67 2.24C14.5 3.27 15 4.58 15 6C15 7.42 14.5 8.73 13.67 9.76C14.09 9.9 14.53 10 15 10Z" fill="currentColor"/>
            </svg>
            Multi-Cast Only
          </button>
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search titles, authors or narrators..." 
              class="search-input"
            />
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
        <p v-if="filteredAudiobooks.length === 0" class="no-results">
          {{ multiCastOnly && searchQuery.trim() 
            ? 'No multi-cast audiobooks match your search.' 
            : multiCastOnly 
            ? 'No multi-cast audiobooks found.' 
            : 'No audiobooks match your search.' }}
        </p>
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

.controls-container {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.multi-cast-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid #e0e2ed;
  border-radius: 30px;
  background: #ffffff;
  color: #6b6d7d;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.multi-cast-toggle:hover {
  border-color: #8a42ff;
  color: #8a42ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(138, 66, 255, 0.15);
}

.multi-cast-toggle.active {
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  border-color: #8a42ff;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(138, 66, 255, 0.3);
}

.multi-cast-toggle svg {
  flex-shrink: 0;
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