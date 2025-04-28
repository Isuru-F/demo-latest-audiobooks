<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Album } from '@/types/spotify';

const props = defineProps<{
  albums: Album[];
}>();

const currentSlide = ref(0);
const intervalId = ref<number | null>(null);

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.albums.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + props.albums.length) % props.albums.length;
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const startAutoplay = () => {
  intervalId.value = window.setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoplay = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<template>
  <div class="featured-carousel">
    <div class="carousel-container">
      <div 
        class="carousel-track" 
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div 
          v-for="(album, index) in albums" 
          :key="album.id"
          class="carousel-slide"
        >
          <div class="slide-content">
            <div class="album-image">
              <img 
                :src="album.images[0]?.url" 
                :alt="album.name" 
                class="album-cover"
              />
            </div>
            <div class="album-info">
              <h2>{{ album.name }}</h2>
              <p class="album-artist">{{ album.artists.map(artist => artist.name).join(', ') }}</p>
              <p class="album-date">{{ new Date(album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</p>
              <a 
                :href="album.external_urls.spotify" 
                target="_blank" 
                rel="noopener noreferrer"
                class="spotify-link"
              >
                Open in Spotify
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <button @click="prevSlide" class="carousel-control prev">&lt;</button>
      <button @click="nextSlide" class="carousel-control next">&gt;</button>
      
      <div class="carousel-indicators">
        <button 
          v-for="(_, index) in albums" 
          :key="index"
          @click="goToSlide(index)"
          :class="['indicator', { active: currentSlide === index }]"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-carousel {
  margin-bottom: 50px;
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-slide {
  flex: 0 0 100%;
  position: relative;
}

.slide-content {
  display: flex;
  background: linear-gradient(135deg, #12123f, #2a1758);
  color: white;
  height: 400px;
}

.album-image {
  flex: 0 0 40%;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.album-cover {
  max-width: 100%;
  max-height: 340px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.album-info {
  flex: 0 0 60%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.album-info h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.2;
}

.album-artist {
  font-size: 24px;
  margin-bottom: 15px;
  opacity: 0.9;
}

.album-date {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.7;
}

.spotify-link {
  display: inline-block;
  background-color: #1db954;
  color: white;
  text-decoration: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  width: fit-content;
}

.spotify-link:hover {
  background-color: #1ed760;
  transform: translateY(-2px);
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-control:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.prev {
  left: 20px;
}

.next {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: white;
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .slide-content {
    flex-direction: column;
    height: auto;
  }
  
  .album-image, .album-info {
    flex: 0 0 100%;
    padding: 20px;
  }
  
  .album-info h2 {
    font-size: 28px;
  }
  
  .album-artist {
    font-size: 20px;
  }
}
</style>