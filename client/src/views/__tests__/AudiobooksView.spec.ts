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
    release_date: '2024-01-15',
    duration_ms: 3600000,
    total_chapters: 10,
    images: [{ url: 'test.jpg' }]
  },
  {
    id: '2',
    name: 'Apple Book',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator B'],
    release_date: '2024-06-20',
    duration_ms: 7200000,
    total_chapters: 15,
    images: [{ url: 'test2.jpg' }]
  },
  {
    id: '3',
    name: 'Middle Book',
    authors: [{ name: 'Author C' }],
    narrators: ['Narrator C'],
    release_date: '2024-03-10',
    duration_ms: 5400000,
    total_chapters: 12,
    images: [{ url: 'test3.jpg' }]
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
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe('Name (A-Z)')
    expect(options[1].text()).toBe('Name (Z-A)')
    expect(options[2].text()).toBe('Release Date (Oldest)')
    expect(options[3].text()).toBe('Release Date (Newest)')
  })

  it('sorts audiobooks by name ascending by default', () => {
    const wrapper = mount(AudiobooksView)
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toContain('Apple Book')
    expect(cards[1].text()).toContain('Middle Book')
    expect(cards[2].text()).toContain('Zebra Book')
  })

  it('sorts audiobooks by name descending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toContain('Zebra Book')
    expect(cards[1].text()).toContain('Middle Book')
    expect(cards[2].text()).toContain('Apple Book')
  })

  it('sorts audiobooks by release date oldest first', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toContain('Zebra Book')
    expect(cards[1].text()).toContain('Middle Book')
    expect(cards[2].text()).toContain('Apple Book')
  })

  it('sorts audiobooks by release date newest first', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toContain('Apple Book')
    expect(cards[1].text()).toContain('Middle Book')
    expect(cards[2].text()).toContain('Zebra Book')
  })
})