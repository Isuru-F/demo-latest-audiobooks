<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSpotifyStore } from '@/stores/spotify';
import AudiobookCard from '@/components/AudiobookCard.vue';

const spotifyStore = useSpotifyStore();
const searchQuery = ref('');
const multiCastOnly = ref(false);

const filteredAudiobooks = computed(() => {
  let result = spotifyStore.audiobooks;
  
  // Apply multi-cast filter if enabled
  if (multiCastOnly.value) {
    result = result.filter(audiobook => {
      return audiobook.narrators && audiobook.narrators.length > 1;
    });
  }
  
  // Apply text search if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(audiobook => {
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
  }
  
  return result;
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
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search titles, authors or narrators..." 
            class="search-input"
          />
          <div class="toggle-container">
            <label for="multicast-toggle" class="toggle-label">
              <input 
                type="checkbox" 
                id="multicast-toggle" 
                v-model="multiCastOnly" 
                class="toggle-input"
              />
              <span class="toggle-text">Multi-Cast Only</span>
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
  margin-top: 15px;
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
}

.toggle-text {
  position: relative;
  padding-left: 50px;
  color: #2a2d3e;
  font-size: 14px;
}

.toggle-text:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background: #f0f2fa;
  transition: background-color 0.3s;
}

.toggle-text:after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  transition: transform 0.3s, background-color 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-text:before {
  background: linear-gradient(90deg, #e942ff, #8a42ff);
}

.toggle-input:checked + .toggle-text:after {
  transform: translateX(20px);
  background: white;
}

.toggle-input:focus + .toggle-text:before {
  box-shadow: 0 0 0 2px rgba(138, 66, 255, 0.2);
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

@media (max-width: 768px) {
  .audiobooks-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-container {
    width: 100%;
  }
  
  .toggle-container {
    margin-top: 15px;
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