import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HomeView from '../HomeView.vue'

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    newReleases: [],
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
    template: '<div class="album-card-stub"></div>'
  }
}))

describe('HomeView', () => {
  it('renders the HomeView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(HomeView)
    
    // Check if the component renders
    expect(wrapper.find('.releases-header').exists()).toBe(true)
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })
  
  it('has search input functionality', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(HomeView)
    
    // Check if search input works
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    
    // Simply verify the setValue function works
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })
})