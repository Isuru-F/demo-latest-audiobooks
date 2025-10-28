<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSpotifyStore } from '@/stores/spotify';
import AlbumCard from '@/components/AlbumCard.vue';
import FeaturedCarousel from '@/components/FeaturedCarousel.vue';
import type { Album } from '@/types/spotify';

const spotifyStore = useSpotifyStore();
const searchQuery = ref('');
const sortOrder = ref('release-date-desc');

const filteredReleases = computed(() => {
  let filtered: Album[];
  
  if (!searchQuery.value.trim()) {
    filtered = [...spotifyStore.newReleases];
  } else {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = spotifyStore.newReleases.filter(album => {
      // Search by album name
      if (album.name.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search by artist name
      const artistMatch = album.artists.some(artist => 
        artist.name.toLowerCase().includes(query)
      );
      
      return artistMatch;
    });
  }
  
  // Apply sorting
  return filtered.sort((a, b) => {
    switch (sortOrder.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'release-date-asc':
        return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
      case 'release-date-desc':
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      default:
        return 0;
    }
  });
});

const featuredAlbums = computed(() => {
  return spotifyStore.newReleases.slice(0, 3);
});

onMounted(() => {
  spotifyStore.fetchNewReleases();
});
</script>

<template>
  <main>
    <section class="hero">
      <div class="hero-content">
        <h1>Latest Music Releases</h1>
        <p>Explore new albums from your favorite artists alongside our audiobook collection</p>
      </div>
    </section>

    <section class="featured" v-if="!spotifyStore.isLoading && !spotifyStore.error && featuredAlbums.length > 0">
      <div class="featured-header">
        <h2>Featured Releases</h2>
      </div>
      <FeaturedCarousel :albums="featuredAlbums" />
    </section>

    <section class="releases">
      <div class="releases-header">
        <h2>Latest Releases</h2>
        <div class="controls-container">
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search albums or artists..." 
              class="search-input"
            />
          </div>
          <div class="sort-container">
            <select v-model="sortOrder" class="sort-select">
              <option value="release-date-desc">Release Date (Newest First)</option>
              <option value="release-date-asc">Release Date (Oldest First)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div v-if="spotifyStore.isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading new releases...</p>
      </div>
      <div v-else-if="spotifyStore.error" class="error">
        <p>{{ spotifyStore.error }}</p>
        <button @click="spotifyStore.fetchNewReleases()">Try Again</button>
      </div>
      <div v-else>
        <p v-if="filteredReleases.length === 0" class="no-results">No albums match your search.</p>
        <div v-else class="album-grid">
          <AlbumCard 
            v-for="album in filteredReleases" 
            :key="album.id" 
            :album="album" 
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

.featured, .releases {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.featured {
  margin-bottom: 40px;
}

.featured-header, .releases-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.featured h2, .releases h2 {
  font-size: 32px;
  color: #2a2d3e;
  position: relative;
  display: inline-block;
  margin: 0;
}

.featured h2::after, .releases h2::after {
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
  gap: 15px;
  flex-wrap: wrap;
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

.sort-container {
  position: relative;
  width: 250px;
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%232a2d3e' d='M1.41 0L6 4.59L10.59 0L12 1.41l-6 6l-6-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 20px center;
  padding-right: 50px;
}

.sort-select:focus {
  outline: none;
  box-shadow: 0 4px 15px rgba(138, 66, 255, 0.2);
  background-color: #ffffff;
}

.sort-select:hover {
  background-color: #e8eaf5;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

@media (min-width: 1200px) {
  .album-grid {
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