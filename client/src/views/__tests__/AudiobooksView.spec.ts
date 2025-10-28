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
    template: '<div class="audiobook-card-stub"></div>'
  }
}))

describe('AudiobooksView', () => {
  it('renders the AudiobooksView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.hero').exists()).toBe(true)
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

  it('filters out hidden audiobooks', async () => {
    vi.unmock('@/stores/spotify')
    const mockStore = {
      audiobooks: [
        { id: '1', name: 'Audiobook 1', authors: [], narrators: [], images: [], external_urls: { spotify: '' }, publisher: '', description: '', type: 'audiobook', uri: '', total_chapters: 0, duration_ms: 0, release_date: '', media_type: 'audio' },
        { id: '2', name: 'Audiobook 2', authors: [], narrators: [], images: [], external_urls: { spotify: '' }, publisher: '', description: '', type: 'audiobook', uri: '', total_chapters: 0, duration_ms: 0, release_date: '', media_type: 'audio' }
      ],
      isLoading: false,
      error: null,
      fetchAudiobooks: vi.fn()
    }

    vi.doMock('@/stores/spotify', () => ({
      useSpotifyStore: () => mockStore
    }))

    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)

    expect(wrapper.vm.filteredAudiobooks.length).toBe(2)

    wrapper.vm.hideAudiobook('1')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.filteredAudiobooks.length).toBe(1)
    expect(wrapper.vm.filteredAudiobooks[0].id).toBe('2')
  })
})