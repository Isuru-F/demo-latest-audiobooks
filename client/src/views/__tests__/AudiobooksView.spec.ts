import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Zebra Stories',
    authors: [{ name: 'Author A' }],
    narrators: [],
    release_date: '2024-01-15',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: 'audio',
    type: 'audiobook',
    uri: '',
    total_chapters: 10,
    duration_ms: 1000
  },
  {
    id: '2',
    name: 'Alpha Tales',
    authors: [{ name: 'Author B' }],
    narrators: [],
    release_date: '2024-03-20',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: 'audio',
    type: 'audiobook',
    uri: '',
    total_chapters: 5,
    duration_ms: 2000
  },
  {
    id: '3',
    name: 'Beta Book',
    authors: [{ name: 'Author C' }],
    narrators: [],
    release_date: '2024-02-10',
    images: [],
    external_urls: { spotify: '' },
    description: '',
    publisher: '',
    media_type: 'audio',
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

  it('renders sort dropdown with correct options', () => {
    const wrapper = mount(AudiobooksView)
    
    const sortDropdown = wrapper.find('.sort-dropdown')
    expect(sortDropdown.exists()).toBe(true)
    
    const options = sortDropdown.findAll('option')
    expect(options).toHaveLength(5)
    expect(options[0].text()).toBe('Sort By')
    expect(options[1].text()).toBe('Title (A-Z)')
    expect(options[2].text()).toBe('Title (Z-A)')
    expect(options[3].text()).toBe('Release Date (Oldest)')
    expect(options[4].text()).toBe('Release Date (Newest)')
  })

  it('sorts audiobooks alphabetically ascending', async () => {
    const wrapper = mount(AudiobooksView)
    const vm = wrapper.vm as any
    
    const sortDropdown = wrapper.find('.sort-dropdown')
    await sortDropdown.setValue('name-asc')
    
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].name).toBe('Alpha Tales')
    expect(sorted[1].name).toBe('Beta Book')
    expect(sorted[2].name).toBe('Zebra Stories')
  })

  it('sorts audiobooks alphabetically descending', async () => {
    const wrapper = mount(AudiobooksView)
    const vm = wrapper.vm as any
    
    const sortDropdown = wrapper.find('.sort-dropdown')
    await sortDropdown.setValue('name-desc')
    
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].name).toBe('Zebra Stories')
    expect(sorted[1].name).toBe('Beta Book')
    expect(sorted[2].name).toBe('Alpha Tales')
  })

  it('sorts audiobooks by release date ascending (oldest first)', async () => {
    const wrapper = mount(AudiobooksView)
    const vm = wrapper.vm as any
    
    const sortDropdown = wrapper.find('.sort-dropdown')
    await sortDropdown.setValue('date-asc')
    
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].release_date).toBe('2024-01-15')
    expect(sorted[1].release_date).toBe('2024-02-10')
    expect(sorted[2].release_date).toBe('2024-03-20')
  })

  it('sorts audiobooks by release date descending (newest first)', async () => {
    const wrapper = mount(AudiobooksView)
    const vm = wrapper.vm as any
    
    const sortDropdown = wrapper.find('.sort-dropdown')
    await sortDropdown.setValue('date-desc')
    
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].release_date).toBe('2024-03-20')
    expect(sorted[1].release_date).toBe('2024-02-10')
    expect(sorted[2].release_date).toBe('2024-01-15')
  })

  it('combines search and sort functionality', async () => {
    const wrapper = mount(AudiobooksView)
    const vm = wrapper.vm as any
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('tales')
    
    const sortDropdown = wrapper.find('.sort-dropdown')
    await sortDropdown.setValue('name-asc')
    
    const filtered = vm.filteredAudiobooks
    expect(filtered.length).toBe(1)
    expect(filtered[0].name).toBe('Alpha Tales')
  })
})