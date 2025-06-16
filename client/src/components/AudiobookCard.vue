<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Audiobook } from '@/types/spotify';
import AudiobookReviews from './AudiobookReviews.vue';

const props = defineProps<{
  audiobook: Audiobook
}>();

const showModal = ref(false);

// Use a separate function to open the modal
const openModal = (event: Event) => {
  // Prevent any other events
  event.stopPropagation();
  event.preventDefault();
  showModal.value = true;
};

// Use a separate function to close the modal
const closeModal = () => {
  showModal.value = false;
};

// Replace the toggle function with the open function
const toggleModal = (event: Event) => {
  openModal(event);
};

// Handle escape key to close modal
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showModal.value) {
    closeModal();
  }
};

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

const formatDuration = (ms: number) => {
  // If ms is not a valid number, return an empty string
  if (isNaN(ms) || ms === undefined) {
    return '';
  }
  
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

// Format narrators to handle both string arrays and object arrays
const formatNarrators = (narrators: any[]) => {
  if (!Array.isArray(narrators)) {
    return String(narrators) === '[object Object]' ? 'Various' : String(narrators);
  }
  
  return narrators.map(narrator => {
    if (typeof narrator === 'string') {
      return narrator;
    } else if (narrator && typeof narrator === 'object') {
      // If narrator is an object, try to get name property, otherwise use 'Narrator'
      return narrator.name || 'Narrator';
    }
    return 'Narrator';
  }).join(', ');
};
</script>

<template>
  <div class="audiobook-card">
    <div class="audiobook-image" @click.stop="toggleModal">
      <img v-if="audiobook.images && audiobook.images.length" :src="audiobook.images[0].url" :alt="audiobook.name" />
      <div v-else class="no-image">No Image</div>
    </div>
    <div class="audiobook-info">
      <h3 class="audiobook-title">{{ audiobook.name }}</h3>
      <p class="audiobook-authors">
        {{ audiobook.authors.map(author => author.name).join(', ') }}
      </p>
      <p class="audiobook-narrator" v-if="audiobook.narrators && audiobook.narrators.length">
          <span class="label">Narrator:</span> {{ formatNarrators(audiobook.narrators) }}
      </p>
      <p class="audiobook-details">
        <span>{{ formatDuration(audiobook.duration_ms) }}</span>
        <span v-if="audiobook.total_chapters && !isNaN(audiobook.total_chapters)"> · {{ audiobook.total_chapters }} chapters</span>
      </p>
      <div class="audiobook-actions">
        <button @click.stop="toggleModal" class="view-details-btn">View Details</button>
        <a :href="audiobook.external_urls.spotify" target="_blank" class="audiobook-link">Open in Spotify</a>
      </div>
    </div>
    
    <!-- Modal/Popover for Audiobook Description -->
    <teleport to="body">  <!-- Teleport the modal to body to avoid nesting issues -->
      <transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <button class="close-btn" @click="closeModal">×</button>
          <div class="modal-header">
            <div class="modal-image">
              <img v-if="audiobook.images && audiobook.images.length" :src="audiobook.images[0].url" :alt="audiobook.name" />
            </div>
            <div class="modal-title">
              <h2>{{ audiobook.name }}</h2>
              <p class="modal-authors">By {{ audiobook.authors.map(author => author.name).join(', ') }}</p>
              <p class="modal-publisher">Publisher: {{ audiobook.publisher }}</p>
              <p class="modal-details">
                <span>{{ formatDuration(audiobook.duration_ms) }}</span>
              </p>
            </div>
          </div>
          <div class="modal-body">
            <h3>Description</h3>
            <div class="description" v-html="audiobook.description"></div>
          </div>
          
          <div class="modal-reviews">
            <AudiobookReviews :audiobook-id="audiobook.id" />
          </div>
          
          <div class="modal-footer">
            <a :href="audiobook.external_urls.spotify" target="_blank" class="spotify-link">Listen on Spotify</a>
          </div>
        </div>
      </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.audiobook-card {
  background: linear-gradient(135deg, #2a2d3e, #1a1c27);
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

.audiobook-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.audiobook-image {
  width: 100%;
  height: 280px;
  overflow: hidden;
  cursor: pointer;
}

.audiobook-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.audiobook-card:hover .audiobook-image img {
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

.audiobook-info {
  padding: 20px;
  color: #fff;
}

.audiobook-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audiobook-authors {
  color: #b2b5c4;
  margin: 0 0 10px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audiobook-narrator {
  color: #8a8c99;
  margin: 0 0 10px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audiobook-details {
  color: #8a8c99;
  margin: 0 0 15px;
  font-size: 12px;
}

.label {
  color: #a9acc6;
  font-weight: 500;
}

.audiobook-actions {
  display: flex;
  gap: 10px;
}

.view-details-btn {
  padding: 8px 16px;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-details-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.audiobook-link {
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

.audiobook-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(138, 66, 255, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Increased z-index */
  padding: 20px;
  will-change: opacity; /* Optimize for animations */
  pointer-events: auto; /* Ensure clicks are captured */
}

.modal-content {
  background: #2a2d3e;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  color: white;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: #f5f6fa;
  font-size: 28px;
  cursor: pointer;
  z-index: 10;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-header {
  padding: 30px;
  display: flex;
  gap: 25px;
  background: linear-gradient(to bottom, rgba(42, 45, 62, 0.8), #2a2d3e);
}

.modal-image {
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-title {
  flex-grow: 1;
}

.modal-title h2 {
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 700;
}

.modal-authors {
  color: #b2b5c4;
  margin: 0 0 8px;
  font-size: 16px;
}

.modal-publisher {
  color: #8a8c99;
  margin: 0 0 8px;
  font-size: 14px;
}

.modal-details {
  color: #a9acc6;
  margin: 0;
  font-size: 14px;
}

.modal-body {
  padding: 10px 30px 30px;
}

.modal-body h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #f5f6fa;
  position: relative;
  display: inline-block;
}

.modal-body h3:after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  border-radius: 1.5px;
}

.modal-body .description {
  line-height: 1.7;
  color: #b2b5c4;
}

.modal-body .description p {
  margin-bottom: 1em;
}

.modal-reviews {
  padding: 0 30px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
  padding-top: 20px;
}

.modal-footer {
  padding: 20px 30px 30px;
  display: flex;
  justify-content: center;
}

.spotify-link {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(90deg, #e942ff, #8a42ff);
  color: white;
  border-radius: 25px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.spotify-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(138, 66, 255, 0.3);
}

/* Modal Animation - Using hardware acceleration for smoother animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform: translateZ(0); /* Force hardware acceleration */
  backface-visibility: hidden;
  perspective: 1000px;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateZ(0) scale(0.95);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: translateZ(0) scale(1);
}

@media (max-width: 768px) {
  .modal-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .modal-image {
    width: 130px;
    height: 130px;
  }
  
  .audiobook-actions {
    flex-direction: column;
  }
}
</style>