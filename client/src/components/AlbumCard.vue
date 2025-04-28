<script setup lang="ts">
import type { Album } from '@/types/spotify';

defineProps<{
  album: Album
}>();
</script>

<template>
  <div class="album-card">
    <div class="album-image">
      <img v-if="album.images && album.images.length" :src="album.images[0].url" :alt="album.name" />
      <div v-else class="no-image">No Image</div>
    </div>
    <div class="album-info">
      <h3 class="album-title">{{ album.name }}</h3>
      <p class="album-artists">
        {{ album.artists.map(artist => artist.name).join(', ') }}
      </p>
      <p class="album-release">{{ new Date(album.release_date).toLocaleDateString() }}</p>
      <a :href="album.external_urls.spotify" target="_blank" class="album-link">Open in Spotify</a>
    </div>
  </div>
</template>

<style scoped>
.album-card {
  background: linear-gradient(135deg, #2a2d3e, #1a1c27);
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.album-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.album-image {
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.album-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.album-card:hover .album-image img {
  transform: scale(1.05);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3a3d4e;
  color: #8a8c99;
}

.album-info {
  padding: 20px;
  color: #fff;
}

.album-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artists {
  color: #b2b5c4;
  margin: 0 0 10px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-release {
  color: #8a8c99;
  margin: 0 0 15px;
  font-size: 12px;
}

.album-link {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  color: white;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.album-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(138, 66, 255, 0.3);
}
</style>