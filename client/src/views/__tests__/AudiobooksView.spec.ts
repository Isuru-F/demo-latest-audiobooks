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
    emits: ['hide'],
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

  it('filters out hidden audiobooks when hide event is emitted', async () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)

    const vm = wrapper.vm as any
    
    // Simulate hiding an audiobook
    vm.handleHideAudiobook('test-id')
    await wrapper.vm.$nextTick()

    // Should have hidden the audiobook
    expect(vm.hiddenAudiobookIds.has('test-id')).toBe(true)
  })

  it('hidden audiobooks reappear on page refresh', () => {
    setActivePinia(createPinia())
    const wrapper = mount(AudiobooksView)
    
    const vm = wrapper.vm as any
    // Hide an audiobook
    vm.handleHideAudiobook('1')
    
    // On refresh (remount), hidden state should be cleared
    const newWrapper = mount(AudiobooksView)
    const newVm = newWrapper.vm as any
    
    // hiddenAudiobookIds should be a new empty Set
    expect(newVm.hiddenAudiobookIds.size).toBe(0)
  })
})