import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Mock store with function to track calls
const fetchAudiobooksMock = vi.fn()

vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => ({
    audiobooks: [],
    isLoading: false,
    error: null,
    fetchAudiobooks: fetchAudiobooksMock
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

// Mock setTimeout
vi.useFakeTimers()

describe('AudiobooksView', () => {
  beforeEach(() => {
    // Reset mock before each test
    fetchAudiobooksMock.mockClear()
    setActivePinia(createPinia())
  })

  it('renders the AudiobooksView component', () => {
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.hero').exists()).toBe(true)
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    expect(wrapper.text()).toContain('Welcome to Audiobook Hub')
  })
  
  it('calls API when search input changes', async () => {  
    const wrapper = mount(AudiobooksView)
    
    // Check that fetchAudiobooks was called once on mount
    expect(fetchAudiobooksMock).toHaveBeenCalledTimes(1)
    
    // Enter search text
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('harry potter')
    
    // Fast forward timers to trigger the debounced search
    vi.runAllTimers()
    await flushPromises()
    
    // Check that fetchAudiobooks was called with search term
    expect(fetchAudiobooksMock).toHaveBeenCalledTimes(2)
    expect(fetchAudiobooksMock).toHaveBeenLastCalledWith(40, 0, 'AU', 'harry potter')
  })
  
  it('has clear search functionality', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enter search text
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test query')
    
    // Check clear button appears
    expect(wrapper.find('.clear-button').exists()).toBe(true)
    
    // Click clear button
    await wrapper.find('.clear-button').trigger('click')
    
    // Check that search input is cleared
    expect(wrapper.vm.searchQuery).toBe('')
    
    // Check that fetchAudiobooks was called without query
    expect(fetchAudiobooksMock).toHaveBeenLastCalledWith()
  })
  
  it('shows loading state while searching', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enter search text
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test query')
    
    // Manually set isSearching to true
    wrapper.vm.isSearching = true
    await wrapper.vm.$nextTick()
    
    // Check loading spinner is shown
    expect(wrapper.find('.spinner').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toContain('Searching...')
  })
})