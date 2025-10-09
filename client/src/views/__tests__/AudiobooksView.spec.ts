import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Alpha Book',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator A'],
    description: 'Description A',
    publisher: 'Publisher A',
    images: [{ url: 'image1.jpg', height: 100, width: 100 }],
    external_urls: { spotify: 'url1' },
    release_date: '2024-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri1',
    total_chapters: 10,
    duration_ms: 3600000,
  },
  {
    id: '2',
    name: 'Zeta Book',
    authors: [{ name: 'Author Z' }],
    narrators: ['Narrator Z'],
    description: 'Description Z',
    publisher: 'Publisher Z',
    images: [{ url: 'image2.jpg', height: 100, width: 100 }],
    external_urls: { spotify: 'url2' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri2',
    total_chapters: 15,
    duration_ms: 7200000,
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
    template: '<div class="audiobook-card-stub"></div>',
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

  it('has sort dropdown with correct options', () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    expect(sortSelect.exists()).toBe(true)

    const options = sortSelect.findAll('option')
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe('Name (A-Z)')
    expect(options[1].text()).toBe('Name (Z-A)')
    expect(options[2].text()).toBe('Release Date (Oldest)')
    expect(options[3].text()).toBe('Release Date (Newest)')
  })

  it('sorts audiobooks by name ascending by default', () => {
    const wrapper = mount(AudiobooksView)
    const vm = wrapper.vm as any
    expect(vm.sortBy).toBe('name-asc')
  })

  it('changes sort order when dropdown value changes', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')

    await sortSelect.setValue('name-desc')
    expect((wrapper.vm as any).sortBy).toBe('name-desc')

    await sortSelect.setValue('date-asc')
    expect((wrapper.vm as any).sortBy).toBe('date-asc')
  })
})