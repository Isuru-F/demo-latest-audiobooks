import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobooksView from '../AudiobooksView.vue'
import { createPinia, setActivePinia } from 'pinia'

const mockSpotifyStore = {
  audiobooks: [
    {
      id: '1',
      name: 'Test Book 1',
      authors: [{ name: 'Author 1' }],
      images: [{ url: 'http://example.com/1.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'http://spotify.com/1' },
      narrators: [],
      duration_ms: 3600000,
      total_chapters: 10
    },
    {
      id: '2',
      name: 'Test Book 2',
      authors: [{ name: 'Author 2' }],
      images: [{ url: 'http://example.com/2.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'http://spotify.com/2' },
      narrators: [],
      duration_ms: 7200000,
      total_chapters: 15
    }
  ],
  isLoading: false,
  error: null,
  fetchAudiobooks: vi.fn()
}

vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockSpotifyStore
}))

vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    emits: ['hide'],
    template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)"></div>'
  }
}))

describe('AudiobooksView - Hide Functionality', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should hide a book when hide event is emitted', async () => {
    const wrapper = mount(AudiobooksView)
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(2)

    await cards[0].trigger('click')
    await wrapper.vm.$nextTick()

    const remainingCards = wrapper.findAll('.audiobook-card-stub')
    expect(remainingCards).toHaveLength(1)
  })

  it('should not persist hidden books on refresh', () => {
    const wrapper1 = mount(AudiobooksView)
    expect(wrapper1.findAll('.audiobook-card-stub')).toHaveLength(2)

    const wrapper2 = mount(AudiobooksView)
    expect(wrapper2.findAll('.audiobook-card-stub')).toHaveLength(2)
  })

  it('should filter hidden books from search results', async () => {
    const wrapper = mount(AudiobooksView)
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('.audiobook-card-stub')
    await cards[0].trigger('click')
    await wrapper.vm.$nextTick()

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Test Book')
    await wrapper.vm.$nextTick()

    const remainingCards = wrapper.findAll('.audiobook-card-stub')
    expect(remainingCards).toHaveLength(1)
  })
})
