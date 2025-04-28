import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSpotifyStore } from '../spotify'
import api from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getNewReleases: vi.fn(),
    getAvailableGenres: vi.fn()
  }
}))

describe('Spotify Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  describe('fetchNewReleases', () => {
    it('should set new releases when API call succeeds', async () => {
      // Mock API response
      const mockResponse = {
        data: {
          albums: {
            items: [
              { id: '1', name: 'Album 1' },
              { id: '2', name: 'Album 2' }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      }
      vi.mocked(api.getNewReleases).mockResolvedValue(mockResponse)

      const store = useSpotifyStore()
      await store.fetchNewReleases()

      expect(api.getNewReleases).toHaveBeenCalledWith(20, 0, 'US')
      expect(store.newReleases).toEqual(mockResponse.data.albums.items)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should set error when API call fails', async () => {
      // Mock API error
      const error = new Error('API error')
      vi.mocked(api.getNewReleases).mockRejectedValue(error)

      const store = useSpotifyStore()
      await store.fetchNewReleases()

      expect(api.getNewReleases).toHaveBeenCalled()
      expect(store.newReleases).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('API error')
    })

    it('should pass custom parameters to the API', async () => {
      // Mock API response
      vi.mocked(api.getNewReleases).mockResolvedValue({
        data: { albums: { items: [] } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      })

      const store = useSpotifyStore()
      await store.fetchNewReleases(10, 5, 'GB')

      expect(api.getNewReleases).toHaveBeenCalledWith(10, 5, 'GB')
    })
  })

  describe('fetchGenres', () => {
    it('should set genres when API call succeeds', async () => {
      // Mock API response
      const mockResponse = {
        data: {
          genres: ['rock', 'pop', 'hip-hop']
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      }
      vi.mocked(api.getAvailableGenres).mockResolvedValue(mockResponse)

      const store = useSpotifyStore()
      await store.fetchGenres()

      expect(api.getAvailableGenres).toHaveBeenCalled()
      expect(store.genres).toEqual(mockResponse.data.genres)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should set error when API call fails', async () => {
      // Mock API error
      const error = new Error('API error')
      vi.mocked(api.getAvailableGenres).mockRejectedValue(error)

      const store = useSpotifyStore()
      await store.fetchGenres()

      expect(api.getAvailableGenres).toHaveBeenCalled()
      expect(store.genres).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('API error')
    })
  })
})