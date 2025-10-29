import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Zebra Book',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator A'],
    description: 'A book about zebras',
    publisher: 'Publisher A',
    images: [],
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
    description: 'A book about apples',
    publisher: 'Publisher B',
    images: [],
    external_urls: { spotify: 'https://spotify.com/2' },
    release_date: '2024-03-20',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    total_chapters: 5,
    duration_ms: 1800000
  },
  {
    id: '3',
    name: 'Mango Book',
    authors: [{ name: 'Author C' }],
    narrators: ['Narrator C'],
    description: 'A book about mangos',
    publisher: 'Publisher C',
    images: [],
    external_urls: { spotify: 'https://spotify.com/3' },
    release_date: '2024-02-10',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:3',
    total_chapters: 8,
    duration_ms: 2700000
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

describe('AudiobooksView Sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have a sort dropdown', () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    expect(sortSelect.exists()).toBe(true)
  })

  it('should sort by name ascending by default', () => {
    const wrapper = mount(AudiobooksView)
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Book')
    expect(cards[1].text()).toBe('Mango Book')
    expect(cards[2].text()).toBe('Zebra Book')
  })

  it('should sort by name descending when selected', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('name-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Mango Book')
    expect(cards[2].text()).toBe('Apple Book')
  })

  it('should sort by release date ascending when selected', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('date-asc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Mango Book')
    expect(cards[2].text()).toBe('Apple Book')
  })

  it('should sort by release date descending when selected', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('date-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Apple Book')
    expect(cards[1].text()).toBe('Mango Book')
    expect(cards[2].text()).toBe('Zebra Book')
  })

  it('should have all sort options', () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    const options = sortSelect.findAll('option')
    
    expect(options.length).toBe(4)
    expect(options[0].text()).toBe('Name (A-Z)')
    expect(options[1].text()).toBe('Name (Z-A)')
    expect(options[2].text()).toBe('Release Date (Oldest)')
    expect(options[3].text()).toBe('Release Date (Newest)')
  })
})
