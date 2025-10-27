import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Charlie Book',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator A'],
    release_date: '2024-01-15',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: '',
    type: 'audiobook',
    uri: '',
    total_chapters: 10,
    duration_ms: 60000,
  },
  {
    id: '2',
    name: 'Alpha Book',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator B'],
    release_date: '2024-03-20',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: '',
    type: 'audiobook',
    uri: '',
    total_chapters: 5,
    duration_ms: 30000,
  },
  {
    id: '3',
    name: 'Beta Book',
    authors: [{ name: 'Author C' }],
    narrators: ['Narrator C'],
    release_date: '2024-02-10',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: '',
    type: 'audiobook',
    uri: '',
    total_chapters: 8,
    duration_ms: 45000,
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

  it('renders sort dropdown with correct options', () => {
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

  it('sorts audiobooks by name ascending by default', async () => {
    const wrapper = mount(AudiobooksView)
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAllComponents({ name: 'AudiobookCard' })
    expect(cards).toHaveLength(3)
  })

  it('sorts audiobooks by name descending when selected', async () => {
    const wrapper = mount(AudiobooksView)

    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    await wrapper.vm.$nextTick()

    expect((sortSelect.element as HTMLSelectElement).value).toBe('name-desc')
  })

  it('sorts audiobooks by release date ascending when selected', async () => {
    const wrapper = mount(AudiobooksView)

    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    await wrapper.vm.$nextTick()

    expect((sortSelect.element as HTMLSelectElement).value).toBe('date-asc')
  })

  it('sorts audiobooks by release date descending when selected', async () => {
    const wrapper = mount(AudiobooksView)

    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    await wrapper.vm.$nextTick()

    expect((sortSelect.element as HTMLSelectElement).value).toBe('date-desc')
  })
})