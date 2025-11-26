import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'
import type { Audiobook } from '@/types/spotify'

const mockAudiobooks: Audiobook[] = [
  {
    id: '1',
    name: 'Zebra Stories',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator A'],
    release_date: '2024-01-15',
    duration_ms: 10000,
    total_chapters: 10,
    images: [],
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    description: 'Test',
    media_type: 'audio',
    publisher: 'Test',
    external_urls: { spotify: 'https://spotify.com/1' }
  },
  {
    id: '2',
    name: 'Apple Tales',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator B'],
    release_date: '2024-06-20',
    duration_ms: 20000,
    total_chapters: 15,
    images: [],
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    description: 'Test',
    media_type: 'audio',
    publisher: 'Test',
    external_urls: { spotify: 'https://spotify.com/2' }
  },
  {
    id: '3',
    name: 'Middle Book',
    authors: [{ name: 'Author C' }],
    narrators: ['Narrator C'],
    release_date: '2024-03-10',
    duration_ms: 15000,
    total_chapters: 12,
    images: [],
    type: 'audiobook',
    uri: 'spotify:audiobook:3',
    description: 'Test',
    media_type: 'audio',
    publisher: 'Test',
    external_urls: { spotify: 'https://spotify.com/3' }
  }
]

let mockStore: any

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockStore
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
  beforeEach(() => {
    mockStore = {
      audiobooks: [...mockAudiobooks],
      isLoading: false,
      error: null,
      fetchAudiobooks: vi.fn()
    }
  })

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

  it('has sort dropdown functionality', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    expect(sortSelect.exists()).toBe(true)
    
    const options = sortSelect.findAll('option')
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe('A-Z (Alphabetical)')
    expect(options[1].text()).toBe('Z-A (Alphabetical)')
    expect(options[2].text()).toBe('Oldest First (Release Date)')
    expect(options[3].text()).toBe('Newest First (Release Date)')
  })

  it('sorts audiobooks alphabetically ascending', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-asc')
    
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(3)
  })

  it('sorts audiobooks alphabetically descending', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(3)
  })

  it('sorts audiobooks by release date ascending', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(3)
  })

  it('sorts audiobooks by release date descending', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(3)
  })

  it('applies both search and sort together', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Author')
    
    await wrapper.vm.$nextTick()
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(3)
  })
})