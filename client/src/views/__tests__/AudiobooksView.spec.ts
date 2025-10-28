import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Test Audiobook 1',
    authors: [{ name: 'Author 1' }],
    images: [{ url: 'test.jpg' }],
    external_urls: { spotify: 'https://spotify.com' },
    duration_ms: 3600000,
    total_chapters: 10
  },
  {
    id: '2',
    name: 'Test Audiobook 2',
    authors: [{ name: 'Author 2' }],
    images: [{ url: 'test2.jpg' }],
    external_urls: { spotify: 'https://spotify.com' },
    duration_ms: 7200000,
    total_chapters: 15
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
    template: '<div class="audiobook-card-stub"></div>'
  }
}))

describe('AudiobooksView', () => {
  it('renders the AudiobooksView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)

    expect(wrapper.find('.audiobooks').exists()).toBe(true)
  })

  it('has search input functionality', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')

    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('hides audiobook when X button is clicked', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)

    const hideBtns = wrapper.findAll('.hide-btn')
    expect(hideBtns.length).toBe(2)

    await hideBtns[0].trigger('click')
    await wrapper.vm.$nextTick()

    const remainingHideBtns = wrapper.findAll('.hide-btn')
    expect(remainingHideBtns.length).toBe(1)
  })

  it('shows all audiobooks after page refresh (no persistence)', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)

    const hideBtns = wrapper.findAll('.hide-btn')
    expect(hideBtns.length).toBe(2)
  })
})