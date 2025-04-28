import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import HomeView from '../HomeView.vue'
import { useSpotifyStore } from '@/stores/spotify'
import type { Album } from '@/types/spotify'

// Mock the AlbumCard component to simplify testing
vi.mock('@/components/AlbumCard.vue', () => ({
  default: {
    name: 'AlbumCard',
    props: ['album'],
    template: '<div class="album-card-stub">{{ album.name }}</div>'
  }
}))

describe('HomeView', () => {
  // Create mock albums for testing
  const mockAlbums: Album[] = [
    {
      id: '1',
      name: 'Test Album 1',
      album_type: 'album',
      artists: [{ id: 'a1', name: 'Artist 1', type: 'artist', uri: '', href: '', external_urls: { spotify: '' } }],
      available_markets: ['US'],
      external_urls: { spotify: '' },
      href: '',
      images: [{ url: 'image1.jpg', height: 300, width: 300 }],
      release_date: '2023-01-01',
      release_date_precision: 'day',
      total_tracks: 10,
      type: 'album',
      uri: ''
    },
    {
      id: '2',
      name: 'Test Album 2',
      album_type: 'album',
      artists: [{ id: 'a2', name: 'Artist 2', type: 'artist', uri: '', href: '', external_urls: { spotify: '' } }],
      available_markets: ['US'],
      external_urls: { spotify: '' },
      href: '',
      images: [{ url: 'image2.jpg', height: 300, width: 300 }],
      release_date: '2023-01-02',
      release_date_precision: 'day',
      total_tracks: 12,
      type: 'album',
      uri: ''
    },
    {
      id: '3',
      name: 'Special Album',
      album_type: 'album',
      artists: [{ id: 'a3', name: 'Unique Artist', type: 'artist', uri: '', href: '', external_urls: { spotify: '' } }],
      available_markets: ['US'],
      external_urls: { spotify: '' },
      href: '',
      images: [{ url: 'image3.jpg', height: 300, width: 300 }],
      release_date: '2023-01-03',
      release_date_precision: 'day',
      total_tracks: 8,
      type: 'album',
      uri: ''
    }
  ]

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('displays all albums when no search query is provided', async () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              spotify: {
                newReleases: mockAlbums,
                isLoading: false,
                error: null
              }
            }
          })
        ]
      }
    })

    // Get the store after it's been created by the component
    const store = useSpotifyStore()

    // Should show all albums
    expect(wrapper.findAll('.album-card-stub').length).toBe(3)
  })

  it('filters albums by name', async () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              spotify: {
                newReleases: mockAlbums,
                isLoading: false,
                error: null
              }
            }
          })
        ]
      }
    })

    // Type in the search input
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Special')

    // Only the matching album should be displayed
    expect(wrapper.findAll('.album-card-stub').length).toBe(1)
    expect(wrapper.findAll('.album-card-stub')[0].text()).toBe('Special Album')
  })

  it('filters albums by artist name', async () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              spotify: {
                newReleases: mockAlbums,
                isLoading: false,
                error: null
              }
            }
          })
        ]
      }
    })

    // Type in the search input
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Unique')

    // Only the matching album should be displayed
    expect(wrapper.findAll('.album-card-stub').length).toBe(1)
    expect(wrapper.findAll('.album-card-stub')[0].text()).toBe('Special Album')
  })

  it('shows a message when no results match the search', async () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              spotify: {
                newReleases: mockAlbums,
                isLoading: false,
                error: null
              }
            }
          })
        ]
      }
    })

    // Type in the search input with a query that won't match anything
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('nonexistent')

    // Should show the no results message
    expect(wrapper.find('.no-results').exists()).toBe(true)
    expect(wrapper.find('.no-results').text()).toBe('No albums match your search.')
  })
})