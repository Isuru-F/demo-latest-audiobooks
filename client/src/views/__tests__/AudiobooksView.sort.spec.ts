import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

const mockAudiobooks = [
  {
    id: '1',
    name: 'Zebra Book',
    authors: [{ name: 'Author A' }],
    release_date: '2024-01-15',
    images: [],
    external_urls: { spotify: '' },
    type: 'audiobook',
    uri: ''
  },
  {
    id: '2',
    name: 'Alpha Book',
    authors: [{ name: 'Author B' }],
    release_date: '2024-03-20',
    images: [],
    external_urls: { spotify: '' },
    type: 'audiobook',
    uri: ''
  },
  {
    id: '3',
    name: 'Middle Book',
    authors: [{ name: 'Author C' }],
    release_date: '2024-02-10',
    images: [],
    external_urls: { spotify: '' },
    type: 'audiobook',
    uri: ''
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
    setActivePinia(createPinia())
  })

  it('sorts audiobooks by name ascending (A-Z)', async () => {
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-asc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Alpha Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Zebra Book')
  })

  it('sorts audiobooks by name descending (Z-A)', async () => {
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Middle Book')
    expect(cards[2].text()).toBe('Alpha Book')
  })

  it('sorts audiobooks by release date ascending (oldest first)', async () => {
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-asc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book') // 2024-01-15
    expect(cards[1].text()).toBe('Middle Book') // 2024-02-10
    expect(cards[2].text()).toBe('Alpha Book') // 2024-03-20
  })

  it('sorts audiobooks by release date descending (newest first)', async () => {
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('date-desc')
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Alpha Book') // 2024-03-20
    expect(cards[1].text()).toBe('Middle Book') // 2024-02-10
    expect(cards[2].text()).toBe('Zebra Book') // 2024-01-15
  })

  it('displays unsorted audiobooks when no sort option is selected', async () => {
    const wrapper = mount(AudiobooksView)
    
    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards[0].text()).toBe('Zebra Book')
    expect(cards[1].text()).toBe('Alpha Book')
    expect(cards[2].text()).toBe('Middle Book')
  })
})
