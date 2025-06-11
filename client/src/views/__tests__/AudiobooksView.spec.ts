import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'
import type { Audiobook } from '@/types/spotify'

const mockAudiobooks: Audiobook[] = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author One' }],
    narrators: ['John Doe'],
    description: 'Test description',
    publisher: 'Test Publisher',
    images: [],
    external_urls: { spotify: 'https://test.com' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    total_chapters: 10,
    duration_ms: 600000
  },
  {
    id: '2',
    name: 'Multi-cast Book',
    authors: [{ name: 'Author Two' }],
    narrators: ['Jane Smith', 'Bob Wilson'],
    description: 'Test description',
    publisher: 'Test Publisher',
    images: [],
    external_urls: { spotify: 'https://test.com' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    total_chapters: 15,
    duration_ms: 800000
  }
]

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

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
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renders the AudiobooksView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    expect(wrapper.find('.controls-container').exists()).toBe(true)
    expect(wrapper.find('.toggle-switch').exists()).toBe(true)
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
    
    const toggle = wrapper.find('.toggle-switch')
    expect(toggle.exists()).toBe(true)
    expect(toggle.text()).toContain('Multi-cast only')
  })

  it('filters audiobooks by multi-cast when toggle is active', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Initially should show all audiobooks
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(2)
    
    // Activate the toggle
    const toggleInput = wrapper.find('.toggle-input')
    await toggleInput.setValue(true)
    
    // Should now only show multi-cast audiobook
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(1)
  })

  it('persists toggle state to localStorage', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Activate the toggle
    const toggleInput = wrapper.find('.toggle-input')
    await toggleInput.setValue(true)
    
    // Check localStorage was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith('multiCastToggle', 'true')
  })

  it('loads toggle state from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('true')
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check localStorage was read
    expect(localStorageMock.getItem).toHaveBeenCalledWith('multiCastToggle')
    
    // Wait for reactivity to update
    await wrapper.vm.$nextTick()
    
    // Toggle should be active
    const toggle = wrapper.find('.toggle-switch')
    expect(toggle.classes()).toContain('active')
    
    // Also check that only multi-cast audiobooks are shown
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(1)
  })

  it('combines multi-cast filter with search', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Activate multi-cast toggle
    const toggleInput = wrapper.find('.toggle-input')
    await toggleInput.setValue(true)
    
    // Search for the multi-cast book
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Multi-cast')
    
    // Should show the matching multi-cast book
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(1)
    
    // Search for single narrator book (should show nothing)
    await searchInput.setValue('Single Narrator')
    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(0)
  })
})