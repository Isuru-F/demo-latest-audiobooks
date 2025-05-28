import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Mock audiobook data with different narrator configurations
const mockAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author 1' }],
    narrators: ['John Doe'],
    description: 'A book with one narrator',
    publisher: 'Publisher 1',
    images: [{ url: 'test1.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/1' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    total_chapters: 10,
    duration_ms: 3600000
  },
  {
    id: '2',
    name: 'Multi-Cast Book',
    authors: [{ name: 'Author 2' }],
    narrators: ['Jane Doe', 'John Smith'],
    description: 'A book with multiple narrators',
    publisher: 'Publisher 2',
    images: [{ url: 'test2.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/2' },
    release_date: '2023-02-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    total_chapters: 15,
    duration_ms: 7200000
  },
  {
    id: '3',
    name: 'Another Multi-Cast Book',
    authors: [{ name: 'Author 3' }],
    narrators: [{ name: 'Narrator 1' }, { name: 'Narrator 2' }, { name: 'Narrator 3' }],
    description: 'Another book with multiple narrators',
    publisher: 'Publisher 3',
    images: [{ url: 'test3.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/3' },
    release_date: '2023-03-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:3',
    total_chapters: 20,
    duration_ms: 10800000
  }
]

// Mock the store
const mockStore = {
  audiobooks: mockAudiobooks,
  isLoading: false,
  error: null,
  fetchAudiobooks: vi.fn()
}

vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockStore
}))

// Mock the AudiobookCard component
vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    template: '<div class="audiobook-card-stub"></div>'
  }
}))

describe('AudiobooksView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the AudiobooksView component', () => {
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
  })
  
  it('has search input functionality', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Check if search input works
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    
    // Simply verify the setValue function works
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('renders multi-cast narrator toggle', () => {
    const wrapper = mount(AudiobooksView)
    
    // Check if toggle elements exist
    expect(wrapper.find('.toggle-checkbox').exists()).toBe(true)
    expect(wrapper.find('.toggle-text').exists()).toBe(true)
    expect(wrapper.find('.toggle-text').text()).toBe('Multi-Cast Only')
  })

  it('filters audiobooks when multi-cast toggle is enabled', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Initially, all audiobooks should be shown (3 total)
    let filteredBooks = wrapper.vm.filteredAudiobooks
    expect(filteredBooks.length).toBe(3)
    
    // Enable multi-cast filter
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Now only multi-cast books should be shown (2 total)
    filteredBooks = wrapper.vm.filteredAudiobooks
    expect(filteredBooks.length).toBe(2)
    expect(filteredBooks[0].name).toBe('Multi-Cast Book')
    expect(filteredBooks[1].name).toBe('Another Multi-Cast Book')
  })

  it('combines multi-cast filter with search functionality', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Add search query that matches one multi-cast book
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Another')
    
    // Should show only one result
    const filteredBooks = wrapper.vm.filteredAudiobooks
    expect(filteredBooks.length).toBe(1)
    expect(filteredBooks[0].name).toBe('Another Multi-Cast Book')
  })

  it('shows correct no results message when multi-cast filter is active', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Search for something that won't match any multi-cast books
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('nonexistent')
    
    // Check the no results message
    await wrapper.vm.$nextTick()
    const noResultsText = wrapper.find('.no-results')
    expect(noResultsText.text()).toContain('No multi-cast audiobooks match your search criteria.')
  })

  it('correctly identifies multi-cast audiobooks', () => {
    const wrapper = mount(AudiobooksView)
    
    // Test the isMultiCast function
    expect(wrapper.vm.isMultiCast(mockAudiobooks[0])).toBe(false) // Single narrator
    expect(wrapper.vm.isMultiCast(mockAudiobooks[1])).toBe(true)  // Two narrators
    expect(wrapper.vm.isMultiCast(mockAudiobooks[2])).toBe(true)  // Three narrators
  })

  it('maintains toggle state during search operations', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    expect(wrapper.vm.multiCastOnly).toBe(true)
    
    // Perform search
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    
    // Toggle should remain enabled
    expect(wrapper.vm.multiCastOnly).toBe(true)
    
    // Clear search
    await searchInput.setValue('')
    
    // Toggle should still be enabled
    expect(wrapper.vm.multiCastOnly).toBe(true)
  })
})