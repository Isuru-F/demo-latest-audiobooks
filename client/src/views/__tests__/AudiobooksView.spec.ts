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
    description: 'Test',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: 'url' },
    release_date: '2024-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri',
    total_chapters: 10,
    duration_ms: 3600000
  },
  {
    id: '2',
    name: 'Alpha Book',
    authors: [{ name: 'Author B' }],
    narrators: ['Narrator 2'],
    description: 'Test',
    publisher: 'Publisher',
    images: [],
    external_urls: { spotify: 'url' },
    release_date: '2024-06-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'uri',
    total_chapters: 5,
    duration_ms: 1800000
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
    expect(options.length).toBe(4)
    expect(options[0].text()).toBe('Name (A-Z)')
    expect(options[1].text()).toBe('Name (Z-A)')
    expect(options[2].text()).toBe('Release Date (Oldest)')
    expect(options[3].text()).toBe('Release Date (Newest)')
  })

  it('sorts audiobooks by name ascending by default', () => {
    const wrapper = mount(AudiobooksView)
    const vm = wrapper.vm as any
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].name).toBe('Alpha Book')
    expect(sorted[1].name).toBe('Zebra Book')
  })

  it('sorts audiobooks by name descending', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    const vm = wrapper.vm as any
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].name).toBe('Zebra Book')
    expect(sorted[1].name).toBe('Alpha Book')
  })

  it('sorts audiobooks by release date oldest first', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    
    const vm = wrapper.vm as any
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].release_date).toBe('2024-01-01')
    expect(sorted[1].release_date).toBe('2024-06-01')
  })

  it('sorts audiobooks by release date newest first', async () => {
    const wrapper = mount(AudiobooksView)
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    
    const vm = wrapper.vm as any
    const sorted = vm.filteredAudiobooks
    expect(sorted[0].release_date).toBe('2024-06-01')
    expect(sorted[1].release_date).toBe('2024-01-01')
  })
})