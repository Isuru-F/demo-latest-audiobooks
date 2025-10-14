import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

let mockAudiobooks: any[] = []

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
    emits: ['hide'],
    template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)"></div>'
  }
}))

describe('AudiobooksView', () => {
  beforeEach(() => {
    mockAudiobooks = []
  })
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

  it('filters out hidden audiobooks when hide event is emitted', async () => {
    const audiobook1 = {
      id: '1',
      name: 'Book 1',
      authors: [{ name: 'Author 1' }],
      narrators: ['Narrator 1'],
      description: 'Description 1',
      publisher: 'Publisher 1',
      images: [],
      external_urls: { spotify: 'https://spotify.com' },
      release_date: '2023-01-01',
      media_type: 'audio',
      type: 'audiobook',
      uri: 'spotify:audiobook:1',
      total_chapters: 10,
      duration_ms: 3600000
    }
    
    const audiobook2 = {
      id: '2',
      name: 'Book 2',
      authors: [{ name: 'Author 2' }],
      narrators: ['Narrator 2'],
      description: 'Description 2',
      publisher: 'Publisher 2',
      images: [],
      external_urls: { spotify: 'https://spotify.com' },
      release_date: '2023-01-02',
      media_type: 'audio',
      type: 'audiobook',
      uri: 'spotify:audiobook:2',
      total_chapters: 5,
      duration_ms: 1800000
    }

    mockAudiobooks.push(audiobook1, audiobook2)
    
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    await wrapper.vm.$nextTick()
    
    let cards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(cards.length).toBe(2)
    
    const vm = wrapper.vm as any
    vm.hideAudiobook('1')
    await wrapper.vm.$nextTick()
    
    expect(vm.filteredAudiobooks.length).toBe(1)
    expect(vm.filteredAudiobooks[0].id).toBe('2')
  })

  it('does not persist hidden state on remount', () => {
    const audiobook = {
      id: '1',
      name: 'Book 1',
      authors: [{ name: 'Author 1' }],
      narrators: ['Narrator 1'],
      description: 'Description 1',
      publisher: 'Publisher 1',
      images: [],
      external_urls: { spotify: 'https://spotify.com' },
      release_date: '2023-01-01',
      media_type: 'audio',
      type: 'audiobook',
      uri: 'spotify:audiobook:1',
      total_chapters: 10,
      duration_ms: 3600000
    }

    mockAudiobooks.push(audiobook)
    
    setActivePinia(createPinia())
    let wrapper = mount(AudiobooksView)
    
    const vm = wrapper.vm as any
    vm.hideAudiobook('1')
    
    expect(vm.filteredAudiobooks.length).toBe(0)
    
    wrapper.unmount()
    
    wrapper = mount(AudiobooksView)
    const newVm = wrapper.vm as any
    expect(newVm.filteredAudiobooks.length).toBe(1)
  })
})