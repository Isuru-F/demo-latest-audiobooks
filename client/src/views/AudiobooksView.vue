<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSpotifyStore } from '@/stores/spotify';
import AudiobookCard from '@/components/AudiobookCard.vue';

const spotifyStore = useSpotifyStore();
const searchQuery = ref('');
const multiCastOnly = ref(false);

// Load multi-cast preference from localStorage
onMounted(() => {
  spotifyStore.fetchAudiobooks();
  const saved = localStorage.getItem('multiCastOnly');
  if (saved) {
    multiCastOnly.value = JSON.parse(saved);
  }
});

// Save multi-cast preference to localStorage
const toggleMultiCast = () => {
  multiCastOnly.value = !multiCastOnly.value;
  localStorage.setItem('multiCastOnly', JSON.stringify(multiCastOnly.value));
};

// Check if audiobook has multiple narrators
const isMultiCast = (audiobook: any) => {
  return audiobook.narrators && audiobook.narrators.length > 1;
};

const filteredAudiobooks = computed(() => {
  let books = spotifyStore.audiobooks;
  
  // First filter by multi-cast if enabled
  if (multiCastOnly.value) {
    books = books.filter(isMultiCast);
  }
  
  // Then filter by search query if present
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
</script>

<template>
  <main>

    <section class="audiobooks">
      <div class="audiobooks-header">
        <h2>Latest Audiobooks via Spotify API</h2>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search titles, authors or narrators..." 
            class="search-input"
          />
          <div class="multi-cast-toggle">
            <button 
              @click="toggleMultiCast"
              :class="['toggle-btn', { active: multiCastOnly }]"
              :title="multiCastOnly ? 'Show all audiobooks' : 'Show only multi-cast audiobooks'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm8 0c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z"/>
                <circle cx="6" cy="12" r="4"/>
                <circle cx="18" cy="12" r="4"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
              Multi-Cast Only
            </button>
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
          {{ multiCastOnly && !searchQuery ? 'No multi-cast audiobooks found.' : 'No audiobooks match your search.' }}
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

.search-container {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
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

.multi-cast-toggle {
  display: flex;
  align-items: center;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e0e2ea;
  border-radius: 25px;
  background: #ffffff;
  color: #6a6b7a;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.toggle-btn:hover {
  border-color: #8a42ff;
  color: #8a42ff;
  transform: translateY(-1px);
}

.toggle-btn.active {
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(138, 66, 255, 0.3);
}

.toggle-btn svg {
  flex-shrink: 0;
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