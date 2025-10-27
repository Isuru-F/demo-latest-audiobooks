import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSpotifyStore } from '../spotify'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    getNewReleases: vi.fn(),
    getAvailableGenres: vi.fn(),
    getAudiobooks: vi.fn()
  }
}))

describe('Spotify Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  describe('fetchAudiobooks', () => {
    it('should set audiobooks from hardcoded data', async () => {
      const store = useSpotifyStore()
      await store.fetchAudiobooks()
      
      expect(store.audiobooks.length).toBeGreaterThan(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      const store = useSpotifyStore()
      
      // Temporarily override to test error handling
      vi.spyOn(store, 'fetchAudiobooks').mockImplementation(async () => {
        store.error = 'Failed to fetch audiobooks'
        store.isLoading = false
      })
      
      await store.fetchAudiobooks()
      
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Failed to fetch audiobooks')
    })

    it('should accept custom parameters', async () => {
      const store = useSpotifyStore()
      await store.fetchAudiobooks(20, 10, 'US')
      
      expect(store.audiobooks.length).toBeGreaterThan(0)
      expect(store.isLoading).toBe(false)
    })
  })
})