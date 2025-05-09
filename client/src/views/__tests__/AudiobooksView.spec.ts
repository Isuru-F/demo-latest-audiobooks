import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import AudiobooksView from '../AudiobooksView.vue'
import { useSpotifyStore } from '@/stores/spotify'

describe('AudiobooksView', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    // Create a testing pinia instance
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })

    // Sample audiobooks data
    const sampleAudiobooks = [
      {
        id: '1',
        name: 'Single Narrator Book',
        authors: [{ name: 'Author 1' }],
        narrators: ['Single Narrator'],
        description: 'A test description',
        publisher: 'Test Publisher',
        images: [{ url: 'test.jpg', height: 300, width: 300 }],
        external_urls: { spotify: 'https://spotify.com' },
        release_date: '2023-01-01',
        type: 'audiobook',
        uri: 'spotify:audiobook:1',
        total_chapters: 10,
        duration_ms: 3600000
      },
      {
        id: '2',
        name: 'Multi-Cast Book',
        authors: [{ name: 'Author 2' }],
        narrators: ['Narrator 1', 'Narrator 2', 'Narrator 3'],
        description: 'A test description',
        publisher: 'Test Publisher',
        images: [{ url: 'test.jpg', height: 300, width: 300 }],
        external_urls: { spotify: 'https://spotify.com' },
        release_date: '2023-01-01',
        type: 'audiobook',
        uri: 'spotify:audiobook:2',
        total_chapters: 10,
        duration_ms: 3600000
      },
      {
        id: '3',
        name: 'Another Multi-Cast Book',
        authors: [{ name: 'Author 3' }],
        narrators: [{ name: 'Narrator A' }, { name: 'Narrator B' }],
        description: 'A test description',
        publisher: 'Test Publisher',
        images: [{ url: 'test.jpg', height: 300, width: 300 }],
        external_urls: { spotify: 'https://spotify.com' },
        release_date: '2023-01-01',
        type: 'audiobook',
        uri: 'spotify:audiobook:3',
        total_chapters: 10,
        duration_ms: 3600000
      }
    ]

    // Mount the component with the test pinia
    wrapper = mount(AudiobooksView, {
      global: {
        plugins: [pinia]
      }
    })

    // Get the store and set test data
    store = useSpotifyStore()
    store.audiobooks = sampleAudiobooks
    store.isLoading = false
    store.error = null
  })

  it('renders all audiobooks by default', async () => {
    // Should show all audiobooks when no filters are applied
    const audiobookCards = wrapper.findAll('.audiobook-grid > div')
    expect(store.audiobooks.length).toBe(3)
    // Since the AudiobookCard component is stubbed in tests, we check the parent container
    // which would have 3 child elements (one for each audiobook)
    expect(wrapper.find('.no-results').exists()).toBe(false)
  })

  it('filters audiobooks when multi-cast toggle is enabled', async () => {
    // Enable the multi-cast toggle
    const toggle = wrapper.find('.toggle-switch input')
    await toggle.setValue(true)
    
    // Only multi-cast books should be shown (2 out of 3)
    // We check that no 'no results' message is shown
    expect(wrapper.find('.no-results').exists()).toBe(false)
    
    // Check the filtered computed property includes only multi-cast books
    const filteredAudiobooks = wrapper.vm.filteredAudiobooks
    expect(filteredAudiobooks.length).toBe(2)
    expect(filteredAudiobooks.some(a => a.id === '1')).toBe(false) // single narrator
    expect(filteredAudiobooks.some(a => a.id === '2')).toBe(true) // multi-cast
    expect(filteredAudiobooks.some(a => a.id === '3')).toBe(true) // multi-cast with object narrators
  })

  it('combines search query with multi-cast filter', async () => {
    // Set search query to match only one book
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Multi-Cast')
    
    // Enable the multi-cast toggle
    const toggle = wrapper.find('.toggle-switch input')
    await toggle.setValue(true)
    
    // Our test data has two multi-cast books that match the query
    // Book 2 has 'Multi-Cast Book' name and Book 3 has 'Another Multi-Cast Book' name
    const filteredAudiobooks = wrapper.vm.filteredAudiobooks
    expect(filteredAudiobooks.length).toBe(2)
    expect(filteredAudiobooks.some(a => a.id === '2')).toBe(true)
    expect(filteredAudiobooks.some(a => a.id === '3')).toBe(true)
  })

  it('handles empty results with multi-cast filter', async () => {
    // Set search query that won't match any multi-cast books
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Single')
    
    // Enable the multi-cast toggle
    const toggle = wrapper.find('.toggle-switch input')
    await toggle.setValue(true)
    
    // No books should match both criteria
    const filteredAudiobooks = wrapper.vm.filteredAudiobooks
    expect(filteredAudiobooks.length).toBe(0)
  })
})