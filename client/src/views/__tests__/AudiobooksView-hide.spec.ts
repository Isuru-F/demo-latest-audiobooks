import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Test Audiobook 1',
    authors: [{ name: 'Author 1' }],
    images: [{ url: 'http://test.com/1.jpg', height: 300, width: 300 }],
    narrators: [{ name: 'Narrator 1' }],
    duration_ms: 60000,
    total_chapters: 10,
    external_urls: { spotify: 'http://test.com/1' },
    description: 'Test description 1',
    publisher: 'Test Publisher 1',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    release_date: '2023-01-01'
  },
  {
    id: '2',
    name: 'Test Audiobook 2',
    authors: [{ name: 'Author 2' }],
    images: [{ url: 'http://test.com/2.jpg', height: 300, width: 300 }],
    narrators: [{ name: 'Narrator 2' }],
    duration_ms: 120000,
    total_chapters: 15,
    external_urls: { spotify: 'http://test.com/2' },
    description: 'Test description 2',
    publisher: 'Test Publisher 2',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    release_date: '2023-02-01'
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
    setActivePinia(createPinia())
  })

  it('should hide audiobook when hide event is emitted', async () => {
    const wrapper = mount(AudiobooksView)
    
    const cards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(cards).toHaveLength(2)
    
    await cards[0].vm.$emit('hide')
    await wrapper.vm.$nextTick()
    
    const remainingCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(remainingCards).toHaveLength(1)
  })

  it('should maintain hidden state across search operations', async () => {
    const wrapper = mount(AudiobooksView)
    
    const cards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    await cards[0].vm.$emit('hide')
    await wrapper.vm.$nextTick()
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Test')
    await wrapper.vm.$nextTick()
    
    const remainingCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(remainingCards).toHaveLength(1)
  })

  it('should reset hidden audiobooks on page refresh (not persisted)', async () => {
    const wrapper1 = mount(AudiobooksView)
    const cards1 = wrapper1.findAllComponents({ name: 'AudiobookCard' })
    await cards1[0].vm.$emit('hide')
    await wrapper1.vm.$nextTick()
    
    const wrapper2 = mount(AudiobooksView)
    const cards2 = wrapper2.findAllComponents({ name: 'AudiobookCard' })
    expect(cards2).toHaveLength(2)
  })
})
