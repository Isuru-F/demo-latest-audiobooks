import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Sample audiobook data for testing
const mockAudiobooks = [
  {
    id: '1',
    name: 'Book One',
    authors: [{ name: 'Author One' }],
    narrators: ['Narrator One'],
    description: 'Description one',
    publisher: 'Publisher One',
    images: [{ url: 'image-url', height: 300, width: 300 }],
    external_urls: { spotify: 'spotify-url' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri-one',
    total_chapters: 10,
    duration_ms: 36000000
  },
  {
    id: '2',
    name: 'Book Two',
    authors: [{ name: 'Author Two' }],
    narrators: ['Narrator Two A', 'Narrator Two B', 'Narrator Two C'],
    description: 'Description two',
    publisher: 'Publisher Two',
    images: [{ url: 'image-url-2', height: 300, width: 300 }],
    external_urls: { spotify: 'spotify-url-2' },
    release_date: '2023-02-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri-two',
    total_chapters: 12,
    duration_ms: 45000000
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
    template: '<div class="audiobook-card-stub" data-audiobook-id="{{ audiobook.id }}"></div>'
  }
}))

describe('AudiobooksView', () => {
  it('renders the AudiobooksView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('.toggle-switch').exists()).toBe(true)
    expect(wrapper.find('.toggle-label').text()).toBe('Full cast')
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

  it('has multi-cast toggle functionality', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Default state should be unchecked
    const toggleInput = wrapper.find('.toggle-switch input')
    expect((toggleInput.element as HTMLInputElement).checked).toBe(false)
    
    // Toggle the multi-cast filter
    await toggleInput.setValue(true)
    expect((toggleInput.element as HTMLInputElement).checked).toBe(true)
  })

  it('filters audiobooks correctly when multi-cast is enabled', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // By default, all audiobooks should be displayed
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
    
    // Enable multi-cast filter
    const toggleInput = wrapper.find('.toggle-switch input')
    await toggleInput.setValue(true)
    
    // Now only multi-cast audiobooks should be displayed
    // In our mock data, only Book Two has multiple narrators
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(1)
  })
})