import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author One' }],
    narrators: ['John Doe'],
    description: 'A book with one narrator',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: '' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    total_chapters: 10,
    duration_ms: 3600000
  },
  {
    id: '2',
    name: 'Multi Cast Book',
    authors: [{ name: 'Author Two' }],
    narrators: ['Jane Smith', 'Bob Johnson'],
    description: 'A book with multiple narrators',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: '' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    total_chapters: 15,
    duration_ms: 5400000
  },
  {
    id: '3',
    name: 'Another Multi Cast',
    authors: [{ name: 'Author Three' }],
    narrators: [{ name: 'Alice Brown' }, { name: 'Charlie Davis' }, { name: 'Eve Wilson' }],
    description: 'A book with three narrators',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: '' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:3',
    total_chapters: 20,
    duration_ms: 7200000
  }
]

let mockStore: any

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockStore
}))

beforeEach(() => {
  mockStore = {
    audiobooks: mockAudiobooks,
    isLoading: false,
    error: null,
    fetchAudiobooks: vi.fn()
  }
})

// Mock the AudiobookCard component
vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    template: '<div class="audiobook-card-stub"></div>'
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

  it('renders multi-cast toggle', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    expect(wrapper.find('.toggle-container').exists()).toBe(true)
    expect(wrapper.find('.toggle-checkbox').exists()).toBe(true)
    expect(wrapper.find('.toggle-text').text()).toBe('Multi-Cast Only')
  })

  it('filters audiobooks when multi-cast toggle is enabled', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Initially shows all audiobooks
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(3)
    
    // Enable multi-cast filter
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Should only show multi-cast audiobooks (2 out of 3)
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(2)
  })

  it('combines multi-cast filter with search', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Search for "Multi Cast Book"
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Multi Cast Book')
    
    // Should show only 1 result
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(1)
  })

  it('shows appropriate no results message', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter and search for non-existent book
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Non-existent book')
    
    // Should show multi-cast specific no results message
    expect(wrapper.find('.no-results').text()).toBe('No multi-cast audiobooks match your search.')
  })

  it('shows multi-cast only no results message when no multi-cast books exist', async () => {
    // Mock store with only single narrator books
    mockStore.audiobooks = [mockAudiobooks[0]] // Only single narrator book
    
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    expect(wrapper.find('.no-results').text()).toBe('No multi-cast audiobooks available.')
  })
})