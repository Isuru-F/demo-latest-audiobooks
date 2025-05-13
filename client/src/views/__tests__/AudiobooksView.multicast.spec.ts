import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Create mock data with multi-cast and single-cast audiobooks
const mockAudiobooks = [
  {
    id: '1',
    name: 'Multi Cast Audiobook',
    authors: [{ name: 'Author 1' }],
    narrators: ['Narrator 1', 'Narrator 2', 'Narrator 3'], // Multiple narrators
    images: [{ url: 'image1.jpg' }],
    external_urls: { spotify: 'url1' },
    description: 'Description 1',
    publisher: 'Publisher 1',
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri1',
    total_chapters: 10,
    duration_ms: 36000000
  },
  {
    id: '2',
    name: 'Single Narrator Audiobook',
    authors: [{ name: 'Author 2' }],
    narrators: ['Single Narrator'], // Single narrator
    images: [{ url: 'image2.jpg' }],
    external_urls: { spotify: 'url2' },
    description: 'Description 2',
    publisher: 'Publisher 2',
    release_date: '2023-02-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri2',
    total_chapters: 8,
    duration_ms: 28800000
  }
]

// Mock the store with our test data
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    audiobooks: mockAudiobooks,
    isLoading: false,
    error: null,
    fetchAudiobooks: vi.fn()
  })
}))

// Mock the AudiobookCard component
vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    template: '<div class="audiobook-card-stub" data-testid="audiobook-card">{{ audiobook.name }}</div>'
  }
}))

describe('AudiobooksView Multi-Cast Filter', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(AudiobooksView)
  })

  it('renders the multi-cast toggle switch', () => {
    // Check if the toggle exists
    const toggleSwitch = wrapper.find('.toggle-switch')
    expect(toggleSwitch.exists()).toBe(true)
    
    // Check if the toggle has the correct label
    const toggleLabel = wrapper.find('.toggle-label')
    expect(toggleLabel.text()).toBe('Multi-Cast Only')
  })

  it('shows all audiobooks when multi-cast toggle is off', () => {
    // By default, the multi-cast toggle should be off
    const audiobookCards = wrapper.findAll('[data-testid="audiobook-card"]')
    expect(audiobookCards.length).toBe(2) // All audiobooks should be visible
  })

  it('filters to show only multi-cast audiobooks when toggle is on', async () => {
    // Toggle the multi-cast filter on
    const toggleInput = wrapper.find('.toggle-switch input')
    await toggleInput.setValue(true)
    
    // Wait for the next DOM update
    await wrapper.vm.$nextTick()
    
    // Check that only multi-cast audiobooks are shown
    const audiobookCards = wrapper.findAll('[data-testid="audiobook-card"]')
    expect(audiobookCards.length).toBe(1) // Only one audiobook should be visible
    expect(audiobookCards[0].text()).toContain('Multi Cast Audiobook')
  })

  it('shows appropriate message when no matching multi-cast audiobooks are found', async () => {
    // First, set a search query that won't match any multi-cast audiobooks
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Single')
    
    // Then toggle the multi-cast filter on
    const toggleInput = wrapper.find('.toggle-switch input')
    await toggleInput.setValue(true)
    
    // Wait for the next DOM update
    await wrapper.vm.$nextTick()
    
    // Check that the correct no-results message is shown
    const noResults = wrapper.find('.no-results')
    expect(noResults.exists()).toBe(true)
    expect(noResults.text()).toContain('No multi-cast audiobooks match your search')
  })

  it('combines search with multi-cast filter', async () => {
    // Set the search query
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Multi')
    
    // Toggle the multi-cast filter on
    const toggleInput = wrapper.find('.toggle-switch input')
    await toggleInput.setValue(true)
    
    // Wait for the next DOM update
    await wrapper.vm.$nextTick()
    
    // Check that only matching multi-cast audiobooks are shown
    const audiobookCards = wrapper.findAll('[data-testid="audiobook-card"]')
    expect(audiobookCards.length).toBe(1)
    expect(audiobookCards[0].text()).toContain('Multi Cast Audiobook')
  })
})