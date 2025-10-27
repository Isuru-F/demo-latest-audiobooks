import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Zebra Book',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator A'],
    description: 'Description 1',
    publisher: 'Publisher 1',
    images: [{ url: 'https://example.com/1.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/1' },
    release_date: '2024-01-15',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    total_chapters: 10,
    duration_ms: 3600000
  },
  {
    id: '2',
    name: 'Apple Book',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator B'],
    description: 'Description 2',
    publisher: 'Publisher 2',
    images: [{ url: 'https://example.com/2.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/2' },
    release_date: '2024-03-20',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    total_chapters: 15,
    duration_ms: 7200000
  },
  {
    id: '3',
    name: 'Middle Book',
    authors: [{ name: 'Author C' }],
    narrators: ['Narrator C'],
    description: 'Description 3',
    publisher: 'Publisher 3',
    images: [{ url: 'https://example.com/3.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com/3' },
    release_date: '2024-02-10',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:3',
    total_chapters: 12,
    duration_ms: 5400000
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
    template: '<div class="audiobook-card-stub">{{ audiobook.name }}</div>'
  }
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

  it('renders sort dropdown', () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    expect(sortSelect.exists()).toBe(true)
  })

  it('has correct sort options', () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    const options = sortSelect.findAll('option')
    expect(options).toHaveLength(5)
    expect(options[0].text()).toBe('Sort by...')
    expect(options[1].text()).toBe('Name (A-Z)')
    expect(options[2].text()).toBe('Name (Z-A)')
    expect(options[3].text()).toBe('Release Date (Oldest)')
    expect(options[4].text()).toBe('Release Date (Newest)')
  })

  it('sorts audiobooks alphabetically ascending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-asc')
    await wrapper.vm.$nextTick()
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Zebra Book')
  })

  it('sorts audiobooks alphabetically descending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    await wrapper.vm.$nextTick()
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Apple Book')
  })

  it('sorts audiobooks by release date ascending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    await wrapper.vm.$nextTick()
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Apple Book')
  })

  it('sorts audiobooks by release date descending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    await wrapper.vm.$nextTick()
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Zebra Book')
  })
})