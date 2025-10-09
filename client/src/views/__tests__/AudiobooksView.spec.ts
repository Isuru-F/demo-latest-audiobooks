import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Zebra Stories',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator 1'],
    release_date: '2024-01-01',
    images: [{ url: 'test.jpg', height: 100, width: 100 }],
    description: 'Test description',
    publisher: 'Test Publisher',
    external_urls: { spotify: 'https://test.com' },
    media_type: 'audio',
    type: 'audiobook',
    uri: 'test:uri',
    total_chapters: 10,
    duration_ms: 1000
  },
  {
    id: '2',
    name: 'Apple Tales',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator 2'],
    release_date: '2024-06-01',
    images: [{ url: 'test2.jpg', height: 100, width: 100 }],
    description: 'Test description 2',
    publisher: 'Test Publisher 2',
    external_urls: { spotify: 'https://test2.com' },
    media_type: 'audio',
    type: 'audiobook',
    uri: 'test:uri2',
    total_chapters: 15,
    duration_ms: 2000
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

  it('has sort dropdown with correct options', () => {
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

  it('sorts audiobooks alphabetically A-Z', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-asc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Tales')
    expect(cards[1].text()).toBe('Zebra Stories')
  })

  it('sorts audiobooks alphabetically Z-A', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Stories')
    expect(cards[1].text()).toBe('Apple Tales')
  })

  it('sorts audiobooks by release date oldest first', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Stories')
    expect(cards[1].text()).toBe('Apple Tales')
  })

  it('sorts audiobooks by release date newest first', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Tales')
    expect(cards[1].text()).toBe('Zebra Stories')
  })
})