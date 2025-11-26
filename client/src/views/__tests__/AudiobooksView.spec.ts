import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author One' }],
    narrators: [{ name: 'Narrator One' }],
    description: 'Description',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: 'url' },
    release_date: '2024-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri',
    total_chapters: 10,
    duration_ms: 1000
  },
  {
    id: '2',
    name: 'Multi-Cast Book',
    authors: [{ name: 'Author Two' }],
    narrators: [{ name: 'Narrator One' }, { name: 'Narrator Two' }],
    description: 'Description',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: 'url' },
    release_date: '2024-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri',
    total_chapters: 10,
    duration_ms: 1000
  },
  {
    id: '3',
    name: 'Another Multi-Cast Book',
    authors: [{ name: 'Author Three' }],
    narrators: [{ name: 'Narrator Three' }, { name: 'Narrator Four' }, { name: 'Narrator Five' }],
    description: 'Description',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: 'url' },
    release_date: '2024-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri',
    total_chapters: 10,
    duration_ms: 1000
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

  it('has multi-cast toggle', () => {
    const wrapper = mount(AudiobooksView)
    
    // Check if toggle exists
    const toggle = wrapper.find('.toggle-checkbox')
    expect(toggle.exists()).toBe(true)
    
    // Check if toggle label exists
    const toggleLabel = wrapper.find('.toggle-label')
    expect(toggleLabel.exists()).toBe(true)
    expect(toggleLabel.text()).toBe('Multi-Cast Only')
  })

  it('filters audiobooks when multi-cast toggle is enabled', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Initially should show all audiobooks
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(3)
    
    // Enable multi-cast toggle
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Should now only show audiobooks with more than one narrator
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
  })

  it('combines multi-cast filter with search', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast toggle
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Search for specific multi-cast book
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Another')
    
    // Should show only the matching multi-cast book
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(1)
  })

  it('shows visual indication when toggle is active', async () => {
    const wrapper = mount(AudiobooksView)
    
    const toggleContainer = wrapper.find('.toggle-container')
    
    // Initially should not have active class
    expect(toggleContainer.classes()).not.toContain('active')
    
    // Enable toggle
    const toggle = wrapper.find('.toggle-checkbox')
    await toggle.setValue(true)
    
    // Should have active class
    expect(toggleContainer.classes()).toContain('active')
  })

})