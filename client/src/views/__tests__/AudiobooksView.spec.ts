import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Sample audiobooks data for testing
const sampleAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author 1' }],
    narrators: ['Single Narrator'],
    images: [],
    external_urls: { spotify: 'https://spotify.com/1' }
  },
  {
    id: '2',
    name: 'Multi Narrator Book',
    authors: [{ name: 'Author 2' }],
    narrators: ['Narrator 1', 'Narrator 2'],
    images: [],
    external_urls: { spotify: 'https://spotify.com/2' }
  },
  {
    id: '3',
    name: 'Another Multi Narrator Book',
    authors: [{ name: 'Author 3' }],
    narrators: [{ name: 'Narrator 3' }, { name: 'Narrator 4' }],
    images: [],
    external_urls: { spotify: 'https://spotify.com/3' }
  }
]

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock as any

// Mock the store
let mockStore = {
  audiobooks: [...sampleAudiobooks],
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
    template: '<div class="audiobook-card-stub" data-id="{{ audiobook.id }}"></div>'
  }
}))

describe('AudiobooksView', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)    
    mockStore.audiobooks = [...sampleAudiobooks]
  })

  it('renders the AudiobooksView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('.filter-toggle').exists()).toBe(true)
  })
  
  it('has search input functionality', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if search input works
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Book')
    
    // Verify we get all books with 'Book' in the name (all of them)
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(3)
  })

  it('has multi-cast filter toggle functionality', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Initially should show all audiobooks
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(3)

    // Enable multi-cast filter
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)
    
    // Should now only show audiobooks with multiple narrators (2 of them)
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
  })

  it('combines search with multi-cast filter', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)
    
    // Add search term
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Multi')
    
    // Should match both multi-cast books (both of our sample multi-cast books have 'Multi' in the name)
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
  })

  it('persists toggle state to localStorage', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)
    
    // Should save state to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('multiCastFilter', 'true')
  })

  it('loads toggle state from localStorage on mount', async () => {
    // Set mock to return true as if toggle was previously enabled
    localStorageMock.getItem.mockReturnValue('true')
    
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Wait for Vue to process the reactive data
    await wrapper.vm.$nextTick()
    
    // Check if the prop is set correctly (not checking DOM element as it may not update synchronously in tests)
    expect((wrapper.vm as any).showMultiCastOnly).toBe(true)
    
    // Should show only multi-cast audiobooks initially
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
  })
})