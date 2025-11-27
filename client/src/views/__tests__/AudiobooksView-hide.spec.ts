import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobooksView from '../AudiobooksView.vue'

const mockStore = {
  audiobooks: [
    {
      id: '1',
      name: 'Test Book 1',
      authors: [{ name: 'Author 1' }],
      images: [],
      narrators: [],
      duration_ms: 1000,
      total_chapters: 5,
      external_urls: { spotify: 'https://spotify.com' }
    },
    {
      id: '2',
      name: 'Test Book 2',
      authors: [{ name: 'Author 2' }],
      images: [],
      narrators: [],
      duration_ms: 2000,
      total_chapters: 10,
      external_urls: { spotify: 'https://spotify.com' }
    }
  ],
  isLoading: false,
  error: null,
  fetchAudiobooks: vi.fn()
}

vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockStore
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
    mockStore.audiobooks = [
      {
        id: '1',
        name: 'Test Book 1',
        authors: [{ name: 'Author 1' }],
        images: [],
        narrators: [],
        duration_ms: 1000,
        total_chapters: 5,
        external_urls: { spotify: 'https://spotify.com' }
      },
      {
        id: '2',
        name: 'Test Book 2',
        authors: [{ name: 'Author 2' }],
        images: [],
        narrators: [],
        duration_ms: 2000,
        total_chapters: 10,
        external_urls: { spotify: 'https://spotify.com' }
      }
    ]
  })

  it('should hide an audiobook when hide event is emitted', async () => {
    const wrapper = mount(AudiobooksView)
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards.length).toBe(2)

    await cards[0].trigger('click')
    await wrapper.vm.$nextTick()

    const cardsAfterHide = wrapper.findAll('.audiobook-card-stub')
    expect(cardsAfterHide.length).toBe(1)
    expect(cardsAfterHide[0].text()).toBe('Test Book 2')
  })

  it('should keep hidden audiobooks after search', async () => {
    const wrapper = mount(AudiobooksView)
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAll('.audiobook-card-stub')
    await cards[0].trigger('click')
    await wrapper.vm.$nextTick()

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Test')
    await wrapper.vm.$nextTick()

    const cardsAfterSearch = wrapper.findAll('.audiobook-card-stub')
    expect(cardsAfterSearch.length).toBe(1)
    expect(cardsAfterSearch[0].text()).toBe('Test Book 2')
  })
})
