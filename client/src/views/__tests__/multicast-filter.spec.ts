import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Create mock audiobooks data with different narrator counts
const mockAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author 1' }],
    narrators: ['Narrator 1'],
    images: [{ url: 'image1.jpg', height: 300, width: 300 }],
    description: 'A book with one narrator',
    publisher: 'Publisher 1',
    release_date: '2023-01-01',
    external_urls: { spotify: 'spotify:url:1' },
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri:1',
    total_chapters: 10,
    duration_ms: 3600000
  },
  {
    id: '2',
    name: 'Multi Narrator Book',
    authors: [{ name: 'Author 2' }],
    narrators: ['Narrator 2', { name: 'Narrator 3' }],
    images: [{ url: 'image2.jpg', height: 300, width: 300 }],
    description: 'A book with multiple narrators',
    publisher: 'Publisher 2',
    release_date: '2023-02-01',
    external_urls: { spotify: 'spotify:url:2' },
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri:2',
    total_chapters: 12,
    duration_ms: 4200000
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

describe('AudiobooksView with Multi-Cast Filter', () => {
  it('renders the multi-cast toggle', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if the multicast toggle exists
    expect(wrapper.find('.toggle-switch').exists()).toBe(true)
    expect(wrapper.find('.toggle-label').text()).toBe('Multi-Cast Only')
  })
  
  it('shows all audiobooks when multi-cast filter is disabled', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Ensure both books are displayed initially
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
  })
  
  it('filters audiobooks to show only those with multiple narrators when enabled', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Enable the multi-cast toggle
    const toggleInput = wrapper.find('.toggle-switch input')
    await toggleInput.setValue(true)
    
    // Check that only multi-narrator books are displayed
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(1)
  })
  
  it('maintains filter state during search operations', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Enable multi-cast filter
    await wrapper.find('.toggle-switch input').setValue(true)
    
    // Apply search
    await wrapper.find('.search-input').setValue('Narrator')
    
    // Should still only show multi-narrator books
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(1)
    
    // Change search to something that matches both
    await wrapper.find('.search-input').setValue('book')
    
    // Should still only show multi-narrator books
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(1)
  })
})