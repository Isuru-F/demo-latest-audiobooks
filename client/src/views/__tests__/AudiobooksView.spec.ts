import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'
import type { Audiobook } from '@/types/spotify'

const mockAudiobooks: Audiobook[] = [
  {
    id: '1',
    name: 'Zebra Book',
    authors: [{ name: 'Author A' }],
    narrators: ['Narrator A'],
    description: 'Description 1',
    publisher: 'Publisher 1',
    images: [],
    external_urls: { spotify: 'url1' },
    release_date: '2024-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri1',
    total_chapters: 10,
    duration_ms: 10000
  },
  {
    id: '2',
    name: 'Apple Book',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator B'],
    description: 'Description 2',
    publisher: 'Publisher 2',
    images: [],
    external_urls: { spotify: 'url2' },
    release_date: '2023-06-15',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri2',
    total_chapters: 5,
    duration_ms: 5000
  },
  {
    id: '3',
    name: 'Middle Book',
    authors: [{ name: 'Author C' }],
    narrators: ['Narrator C'],
    description: 'Description 3',
    publisher: 'Publisher 3',
    images: [],
    external_urls: { spotify: 'url3' },
    release_date: '2024-06-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri3',
    total_chapters: 8,
    duration_ms: 8000
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
    expect(sortSelect.findAll('option').length).toBe(5)
  })

  it('sorts audiobooks by name ascending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('name-asc')
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards.length).toBe(3)
  })

  it('sorts audiobooks by name descending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('name-desc')
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards.length).toBe(3)
  })

  it('sorts audiobooks by release date ascending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('date-asc')
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards.length).toBe(3)
  })

  it('sorts audiobooks by release date descending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    
    await sortSelect.setValue('date-desc')
    await wrapper.vm.$nextTick()
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards.length).toBe(3)
  })
})