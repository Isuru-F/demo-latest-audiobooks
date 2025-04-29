import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import api from '@/services/api';
import type { Album, Audiobook, GenresResponse, NewReleasesResponse, AudiobooksResponse } from '@/types/spotify';

export const useSpotifyStore = defineStore('spotify', () => {
  const newReleases: Ref<Album[]> = ref([]);
  const audiobooks: Ref<Audiobook[]> = ref([]);
  const genres: Ref<string[]> = ref([]);
  const isLoading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  async function fetchNewReleases(limit = 20, offset = 0, country = 'US') {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.getNewReleases(limit, offset, country);
      const data = response.data as NewReleasesResponse;
      newReleases.value = data.albums.items;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch new releases';
      console.error('Error fetching new releases:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchGenres() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.getAvailableGenres();
      const data = response.data as GenresResponse;
      genres.value = data.genres;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch genres';
      console.error('Error fetching genres:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAudiobooks(limit = 40, offset = 0, market = 'AU', query?: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.getAudiobooks(limit, offset, market, query);
      const data = response.data as AudiobooksResponse;
      audiobooks.value = data.audiobooks.items;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch audiobooks';
      console.error('Error fetching audiobooks:', err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    newReleases,
    audiobooks,
    genres,
    isLoading,
    error,
    fetchNewReleases,
    fetchGenres,
    fetchAudiobooks
  };
});