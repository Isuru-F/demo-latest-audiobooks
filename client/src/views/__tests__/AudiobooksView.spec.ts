import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Mock data with single and multiple narrators
const mockAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author 1' }],
    narrators: ['Single Narrator'],
    images: [],
    external_urls: { spotify: 'https://spotify.com' },
    duration_ms: 1000,
    total_chapters: 10,
    publisher: 'Test Publisher'
  },
  {
    id: '2',
    name: 'Multiple Narrator Book',
    authors: [{ name: 'Author 2' }],
    narrators: ['Narrator 1', 'Narrator 2'],
    images: [],
    external_urls: { spotify: 'https://spotify.com' },
    duration_ms: 2000,
    total_chapters: 20,
    publisher: 'Test Publisher'
  },
  {
    id: '3',
    name: 'Object Narrators Book',
    authors: [{ name: 'Author 3' }],
    narrators: [{ name: 'Narrator 3' }, { name: 'Narrator 4' }],
    images: [],
    external_urls: { spotify: 'https://spotify.com' },
    duration_ms: 3000,
    total_chapters: 30,
    publisher: 'Test Publisher'
  }
]

// Mock the store
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
    template: '<div class="audiobook-card-stub" :data-id="audiobook.id"></div>'
  }
}))

describe('AudiobooksView', () => {
  it('renders the AudiobooksView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    
  })
  
  it('has search input functionality', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if search input works
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    
    // Simply verify the setValue function works
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('has Multi-Cast Only toggle that filters audiobooks', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Toggle should exist
    const multiCastToggle = wrapper.find('.multi-cast-toggle')
    expect(multiCastToggle.exists()).toBe(true)
    
    // By default all audiobooks should be visible
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(3)
    
    // Click the toggle to enable multi-cast only
    await multiCastToggle.trigger('click')
    
    // Now only audiobooks with multiple narrators should be visible
    const filteredCards = wrapper.findAll('.audiobook-card-stub')
    expect(filteredCards.length).toBe(2) // Only the books with multiple narrators
    expect(filteredCards[0].attributes('data-id')).toBe('2')
    expect(filteredCards[1].attributes('data-id')).toBe('3')
    
    // Toggle state should persist when searching
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Multiple')
    
    // Only multiple narrator books matching the search should be visible
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(1)
    expect(wrapper.find('.audiobook-card-stub').attributes('data-id')).toBe('2')
    
    // Clear search but toggle should still be active
    await searchInput.setValue('')
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
    
    // Disable toggle to show all audiobooks again
    await multiCastToggle.trigger('click')
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(3)
  })
})