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
    it('should set audiobooks when API call is successful', async () => {
      const mockResponse = {
        data: {
          audiobooks: {
            items: [{ id: '1', name: 'Test Audiobook' }]
          }
        }
      }
      
      // Type cast as any to avoid AxiosResponse typing issues in tests
      vi.mocked(api.getAudiobooks).mockResolvedValue(mockResponse as any)
      
      const store = useSpotifyStore()
      await store.fetchAudiobooks()
      
      expect(api.getAudiobooks).toHaveBeenCalledWith(40, 0, 'AU')
      expect(store.audiobooks).toEqual([{ id: '1', name: 'Test Audiobook' }])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should set error when API call fails', async () => {
      const mockError = new Error('API Error')
      vi.mocked(api.getAudiobooks).mockRejectedValue(mockError)
      
      const store = useSpotifyStore()
      await store.fetchAudiobooks()
      
      expect(api.getAudiobooks).toHaveBeenCalled()
      expect(store.audiobooks).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('API Error')
    })

    it('should pass custom parameters to API', async () => {
      // Type cast as any to avoid AxiosResponse typing issues in tests
      vi.mocked(api.getAudiobooks).mockResolvedValue({
        data: { audiobooks: { items: [] } }
      } as any)
      
      const store = useSpotifyStore()
      await store.fetchAudiobooks(20, 10, 'US')
      
      expect(api.getAudiobooks).toHaveBeenCalledWith(20, 10, 'US')
    })
  })
})