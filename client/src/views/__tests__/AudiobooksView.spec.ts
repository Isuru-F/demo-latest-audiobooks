import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Test Audiobook 1',
    authors: [{ name: 'Author 1' }],
    narrators: [],
    images: [],
    external_urls: { spotify: 'https://spotify.com/1' },
    duration_ms: 3600000,
    total_chapters: 10,
  },
  {
    id: '2',
    name: 'Test Audiobook 2',
    authors: [{ name: 'Author 2' }],
    narrators: [],
    images: [],
    external_urls: { spotify: 'https://spotify.com/2' },
    duration_ms: 7200000,
    total_chapters: 20,
  },
]

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    audiobooks: mockAudiobooks,
    isLoading: false,
    error: null,
    fetchAudiobooks: vi.fn(),
  }),
}))

// Mock the AudiobookCard component
vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    emits: ['hide'],
    template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)"></div>',
  },
}))

describe('AudiobooksView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the AudiobooksView component', () => {
    const wrapper = mount(AudiobooksView)

    expect(wrapper.find('.audiobooks').exists()).toBe(true)
  })

  it('has search input functionality', async () => {
    const wrapper = mount(AudiobooksView)

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')

    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('displays all audiobooks initially', () => {
    const wrapper = mount(AudiobooksView)

    const audiobookCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(audiobookCards).toHaveLength(2)
  })

  it('hides an audiobook when hide event is emitted', async () => {
    const wrapper = mount(AudiobooksView)

    let audiobookCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(audiobookCards).toHaveLength(2)

    await audiobookCards[0].trigger('click')
    await wrapper.vm.$nextTick()

    audiobookCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(audiobookCards).toHaveLength(1)
  })

  it('keeps hidden audiobooks hidden after search', async () => {
    const wrapper = mount(AudiobooksView)

    let audiobookCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    await audiobookCards[0].trigger('click')
    await wrapper.vm.$nextTick()

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Test')
    await wrapper.vm.$nextTick()

    audiobookCards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(audiobookCards).toHaveLength(1)
  })
})