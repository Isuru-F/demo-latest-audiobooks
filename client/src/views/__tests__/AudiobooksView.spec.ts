import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Zebra Book',
    authors: [{ name: 'Author A' }],
    narrators: [],
    release_date: '2023-01-01',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: '',
    type: 'audiobook',
    uri: '',
    total_chapters: 10,
    duration_ms: 1000
  },
  {
    id: '2',
    name: 'Apple Book',
    authors: [{ name: 'Author B' }],
    narrators: [],
    release_date: '2024-06-15',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: '',
    type: 'audiobook',
    uri: '',
    total_chapters: 5,
    duration_ms: 2000
  },
  {
    id: '3',
    name: 'Middle Book',
    authors: [{ name: 'Author C' }],
    narrators: [],
    release_date: '2023-12-31',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: '',
    type: 'audiobook',
    uri: '',
    total_chapters: 8,
    duration_ms: 1500
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

  it('renders sort dropdown with correct options', () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    expect(sortSelect.exists()).toBe(true)
    
    const options = sortSelect.findAll('option')
    expect(options).toHaveLength(5)
    expect(options[0].text()).toBe('Default Order')
    expect(options[1].text()).toBe('Title (A-Z)')
    expect(options[2].text()).toBe('Title (Z-A)')
    expect(options[3].text()).toBe('Release Date (Oldest)')
    expect(options[4].text()).toBe('Release Date (Newest)')
  })

  it('sorts audiobooks by title ascending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('title-asc')
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Zebra Book')
  })

  it('sorts audiobooks by title descending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('title-desc')
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

  it('maintains sorting when filtering with search', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    const searchInput = wrapper.find('.search-input')
    
    await sortSelect.setValue('title-asc')
    await searchInput.setValue('Book')
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Zebra Book')
  })
})