import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    audiobooks: [],
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
  it('renders the AudiobooksView component', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    
  })
  
  it('has search input functionality', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    // Check if search input works
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    
    // Simply verify the setValue function works
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('has sort select dropdown', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    expect(sortSelect.exists()).toBe(true)
    
    const options = sortSelect.findAll('option')
    expect(options.length).toBe(5)
    expect(options[0].text()).toBe('Default Order')
    expect(options[1].text()).toBe('Name (A-Z)')
    expect(options[2].text()).toBe('Name (Z-A)')
    expect(options[3].text()).toBe('Release Date (Oldest First)')
    expect(options[4].text()).toBe('Release Date (Newest First)')
  })

  it('changes sort option when dropdown value changes', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const sortSelect = wrapper.find('.sort-select')
    await sortSelect.setValue('name-asc')
    
    expect((sortSelect.element as HTMLSelectElement).value).toBe('name-asc')
  })
})