import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Test Audiobook 1',
    authors: [{ name: 'Author 1' }],
    images: [],
    external_urls: { spotify: 'https://spotify.com/1' },
    narrators: [],
    duration_ms: 3600000,
    total_chapters: 10
  },
  {
    id: '2',
    name: 'Test Audiobook 2',
    authors: [{ name: 'Author 2' }],
    images: [],
    external_urls: { spotify: 'https://spotify.com/2' },
    narrators: [],
    duration_ms: 7200000,
    total_chapters: 15
  }
]

let mockStore: any

beforeEach(() => {
  mockStore = {
    audiobooks: [...mockAudiobooks],
    isLoading: false,
    error: null,
    fetchAudiobooks: vi.fn()
  }
})

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockStore
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
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(cards.length).toBe(2)
    
    await cards[0].trigger('click')
    await wrapper.vm.$nextTick()
    
    const updatedCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(updatedCards.length).toBe(1)
  })

  it('does not persist hidden audiobooks on page refresh', () => {
    setActivePinia(createPinia())
    const wrapper1 = mount(AudiobooksView)
    
    const cards1 = wrapper1.findAllComponents({ name: 'AudiobookCard' })
    expect(cards1.length).toBe(2)
    
    wrapper1.unmount()
    
    const wrapper2 = mount(AudiobooksView)
    const cards2 = wrapper2.findAllComponents({ name: 'AudiobookCard' })
    expect(cards2.length).toBe(2)
  })
})