import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Test Audiobook 1',
    authors: [{ name: 'Author 1' }],
    narrators: [{ name: 'Narrator 1' }],
    duration_ms: 3600000,
    total_chapters: 10,
    images: [{ url: 'test1.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/1' },
    publisher: 'Publisher 1',
    description: 'Description 1',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
  },
  {
    id: '2',
    name: 'Test Audiobook 2',
    authors: [{ name: 'Author 2' }],
    narrators: [{ name: 'Narrator 2' }],
    duration_ms: 7200000,
    total_chapters: 15,
    images: [{ url: 'test2.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/2' },
    publisher: 'Publisher 2',
    description: 'Description 2',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
  }
]

vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    audiobooks: mockAudiobooks,
    isLoading: false,
    error: null,
    fetchAudiobooks: vi.fn()
  })
}))

vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    emits: ['hide'],
    template: '<div class="audiobook-card-stub" @click="$emit(\'hide\')">{{ audiobook.name }}</div>'
  }
}))

describe('AudiobooksView - Hide Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initially displays all audiobooks', () => {
    const wrapper = mount(AudiobooksView)
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(2)
  })

  it('hides audiobook when hide event is emitted', async () => {
    const wrapper = mount(AudiobooksView)
    
    let cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(2)
    
    await cards[0].trigger('click')
    
    cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toBe('Test Audiobook 2')
  })

  it('can hide multiple audiobooks', async () => {
    const wrapper = mount(AudiobooksView)
    
    let cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(2)
    
    await cards[0].trigger('click')
    await cards[1].trigger('click')
    
    cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(0)
  })

  it('hidden audiobooks remain hidden when search query changes', async () => {
    const wrapper = mount(AudiobooksView)
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    await cards[0].trigger('click')
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Test')
    
    const visibleCards = wrapper.findAll('.audiobook-card-stub')
    expect(visibleCards).toHaveLength(1)
    expect(visibleCards[0].text()).toBe('Test Audiobook 2')
  })
})
