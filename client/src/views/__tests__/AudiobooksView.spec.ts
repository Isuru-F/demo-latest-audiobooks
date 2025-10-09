import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Zebra Book',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator 1'],
    release_date: '2023-01-01',
    description: 'Test',
    publisher: 'Test Publisher',
    images: [],
    external_urls: { spotify: '' },
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    total_chapters: 10,
    duration_ms: 10000
  },
  {
    id: '2',
    name: 'Alpha Book',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator 2'],
    release_date: '2024-01-01',
    description: 'Test',
    publisher: 'Test Publisher',
    images: [],
    external_urls: { spotify: '' },
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    total_chapters: 10,
    duration_ms: 10000
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
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe('Name (A-Z)')
    expect(options[1].text()).toBe('Name (Z-A)')
    expect(options[2].text()).toBe('Release Date (Oldest)')
    expect(options[3].text()).toBe('Release Date (Newest)')
  })

  it('sorts audiobooks alphabetically ascending by default', () => {
    const wrapper = mount(AudiobooksView)
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Alpha Book')
    expect(cards[1].text()).toBe('Zebra Book')
  })

  it('sorts audiobooks alphabetically descending when selected', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Alpha Book')
  })

  it('sorts audiobooks by release date ascending when selected', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Alpha Book')
  })

  it('sorts audiobooks by release date descending when selected', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Alpha Book')
    expect(cards[1].text()).toBe('Zebra Book')
  })
})