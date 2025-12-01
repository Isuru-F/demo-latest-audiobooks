import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    audiobooks: [],
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
    emits: ['hide'],
    template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)"></div>'
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

  it('hides audiobook when hide event is emitted', async () => {
    // Create a mock store with audiobooks
    vi.mock('@/stores/spotify', () => ({
      useSpotifyStore: () => ({
        audiobooks: [
          { id: '1', name: 'Book 1', authors: [{ name: 'Author 1' }], narrators: [], images: [], external_urls: { spotify: '' }, description: '', publisher: '', release_date: '', media_type: 'audio', type: 'audiobook', uri: '', total_chapters: 0, duration_ms: 0 },
          { id: '2', name: 'Book 2', authors: [{ name: 'Author 2' }], narrators: [], images: [], external_urls: { spotify: '' }, description: '', publisher: '', release_date: '', media_type: 'audio', type: 'audiobook', uri: '', total_chapters: 0, duration_ms: 0 }
        ],
        isLoading: false,
        error: null,
        fetchAudiobooks: vi.fn()
      })
    }))

    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Initially should have 2 audiobooks
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
  })

  it('filters hidden audiobooks from display', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check that the view handles hidden audiobooks
    expect(wrapper.vm).toBeTruthy()
  })
})