import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HomeView from '../HomeView.vue'
import type { Album } from '@/types/spotify'

const mockAlbums: Album[] = [
  {
    id: '1',
    name: 'Zebra Album',
    album_type: 'album',
    artists: [{ id: '1', name: 'Artist A', type: 'artist', uri: 'uri1', href: 'href1', external_urls: { spotify: 'url1' } }],
    available_markets: ['US'],
    external_urls: { spotify: 'url1' },
    href: 'href1',
    images: [],
    release_date: '2024-01-15',
    release_date_precision: 'day',
    total_tracks: 10,
    type: 'album',
    uri: 'uri1'
  },
  {
    id: '2',
    name: 'Apple Album',
    album_type: 'album',
    artists: [{ id: '2', name: 'Artist B', type: 'artist', uri: 'uri2', href: 'href2', external_urls: { spotify: 'url2' } }],
    available_markets: ['US'],
    external_urls: { spotify: 'url2' },
    href: 'href2',
    images: [],
    release_date: '2024-03-20',
    release_date_precision: 'day',
    total_tracks: 12,
    type: 'album',
    uri: 'uri2'
  },
  {
    id: '3',
    name: 'Middle Album',
    album_type: 'album',
    artists: [{ id: '3', name: 'Artist C', type: 'artist', uri: 'uri3', href: 'href3', external_urls: { spotify: 'url3' } }],
    available_markets: ['US'],
    external_urls: { spotify: 'url3' },
    href: 'href3',
    images: [],
    release_date: '2024-02-10',
    release_date_precision: 'day',
    total_tracks: 8,
    type: 'album',
    uri: 'uri3'
  }
]

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    newReleases: mockAlbums,
    isLoading: false,
    error: null,
    fetchNewReleases: vi.fn()
  })
}))

// Mock the AlbumCard component to simplify testing
vi.mock('@/components/AlbumCard.vue', () => ({
  default: {
    name: 'AlbumCard',
    props: ['album'],
    template: '<div class="album-card-stub">{{ album.name }}</div>'
  }
}))

// Mock FeaturedCarousel component
vi.mock('@/components/FeaturedCarousel.vue', () => ({
  default: {
    name: 'FeaturedCarousel',
    props: ['albums'],
    template: '<div class="featured-carousel-stub"></div>'
  }
}))

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the HomeView component', () => {
    const wrapper = mount(HomeView)
    
    expect(wrapper.find('.releases-header').exists()).toBe(true)
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('.sort-select').exists()).toBe(true)
  })
  
  it('has search input functionality', async () => {
    const wrapper = mount(HomeView)
    
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('renders sort dropdown with correct options', () => {
    const wrapper = mount(HomeView)
    
    const sortSelect = wrapper.find('.sort-select')
    expect(sortSelect.exists()).toBe(true)
    
    const options = sortSelect.findAll('option')
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe('Release Date (Newest First)')
    expect(options[1].text()).toBe('Release Date (Oldest First)')
    expect(options[2].text()).toBe('Name (A-Z)')
    expect(options[3].text()).toBe('Name (Z-A)')
  })

  it('sorts albums by name A-Z', async () => {
    const wrapper = mount(HomeView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-asc')
    
    await wrapper.vm.$nextTick()
    
    const albumCards = wrapper.findAll('.album-card-stub')
    expect(albumCards[0].text()).toBe('Apple Album')
    expect(albumCards[1].text()).toBe('Middle Album')
    expect(albumCards[2].text()).toBe('Zebra Album')
  })

  it('sorts albums by name Z-A', async () => {
    const wrapper = mount(HomeView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-desc')
    
    await wrapper.vm.$nextTick()
    
    const albumCards = wrapper.findAll('.album-card-stub')
    expect(albumCards[0].text()).toBe('Zebra Album')
    expect(albumCards[1].text()).toBe('Middle Album')
    expect(albumCards[2].text()).toBe('Apple Album')
  })

  it('sorts albums by release date newest first', async () => {
    const wrapper = mount(HomeView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('release-date-desc')
    
    await wrapper.vm.$nextTick()
    
    const albumCards = wrapper.findAll('.album-card-stub')
    expect(albumCards[0].text()).toBe('Apple Album')
    expect(albumCards[1].text()).toBe('Middle Album')
    expect(albumCards[2].text()).toBe('Zebra Album')
  })

  it('sorts albums by release date oldest first', async () => {
    const wrapper = mount(HomeView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('release-date-asc')
    
    await wrapper.vm.$nextTick()
    
    const albumCards = wrapper.findAll('.album-card-stub')
    expect(albumCards[0].text()).toBe('Zebra Album')
    expect(albumCards[1].text()).toBe('Middle Album')
    expect(albumCards[2].text()).toBe('Apple Album')
  })
})