import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Mock the store
vi.mock('@/stores/spotify', () => {
  // Create mock audiobooks - some with multiple narrators, some with one
  const mockAudiobooks = [
    { 
      id: '1', 
      name: 'Single Narrator Book', 
      authors: [{ name: 'Author 1' }], 
      narrators: ['Single Narrator'], 
      images: [], 
      external_urls: { spotify: '' }, 
      release_date: '', 
      publisher: '', 
      description: '',
      media_type: '',
      type: '',
      uri: '',
      total_chapters: 10,
      duration_ms: 3600000
    },
    { 
      id: '2', 
      name: 'Multi Narrator Book', 
      authors: [{ name: 'Author 2' }], 
      narrators: ['Narrator 1', 'Narrator 2', 'Narrator 3'], 
      images: [], 
      external_urls: { spotify: '' }, 
      release_date: '', 
      publisher: '', 
      description: '',
      media_type: '',
      type: '',
      uri: '',
      total_chapters: 12,
      duration_ms: 4600000
    },
    { 
      id: '3', 
      name: 'Another Single Narrator', 
      authors: [{ name: 'Author 3' }], 
      narrators: [{ name: 'Narrator Object' }], 
      images: [], 
      external_urls: { spotify: '' }, 
      release_date: '', 
      publisher: '', 
      description: '',
      media_type: '',
      type: '',
      uri: '',
      total_chapters: 8,
      duration_ms: 2600000
    },
    { 
      id: '4', 
      name: 'Book with null narrators', 
      authors: [{ name: 'Author 4' }], 
      narrators: null, 
      images: [], 
      external_urls: { spotify: '' }, 
      release_date: '', 
      publisher: '', 
      description: '',
      media_type: '',
      type: '',
      uri: '',
      total_chapters: 5,
      duration_ms: 1800000
    }
  ];
  
  return {
    useSpotifyStore: () => ({
      audiobooks: mockAudiobooks,
      isLoading: false,
      error: null,
      fetchAudiobooks: vi.fn()
    })
  }
})

// Mock the AudiobookCard component
vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    template: '<div class="audiobook-card-stub" data-testid="audiobook-card">{{ audiobook.name }}</div>'
  }
}))

describe('Multicast Filter', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should show all audiobooks when multicast filter is off', () => {
    const wrapper = mount(AudiobooksView)
    
    // With filter off, should show all four books
    const audiobookCards = wrapper.findAll('[data-testid="audiobook-card"]')
    expect(audiobookCards.length).toBe(4)
  })
  
  it('should only show multi-narrator audiobooks when filter is on', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Toggle the multi-cast filter on
    const toggle = wrapper.find('.toggle input[type="checkbox"]')
    await toggle.setValue(true)
    
    // Now should only show the single book with multiple narrators
    const audiobookCards = wrapper.findAll('[data-testid="audiobook-card"]')
    expect(audiobookCards.length).toBe(1)
    expect(audiobookCards[0].text()).toContain('Multi Narrator Book')
  })
  
  it('should work with search filter when both are active', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enable multicast filter
    const toggle = wrapper.find('.toggle input[type="checkbox"]')
    await toggle.setValue(true)
    
    // Add search term that should match the multi-cast book
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Multi')
    
    // Should still show one result
    const audiobookCards = wrapper.findAll('[data-testid="audiobook-card"]')
    expect(audiobookCards.length).toBe(1)
    expect(audiobookCards[0].text()).toContain('Multi Narrator Book')
    
    // Change search term to something that won't match the multi-cast book
    await searchInput.setValue('Single')
    
    // Should now show no results
    const updatedCards = wrapper.findAll('[data-testid="audiobook-card"]')
    expect(updatedCards.length).toBe(0)
  })
  
  it('should persist filter state when search changes', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Enable multicast filter
    const toggle = wrapper.find('.toggle input[type="checkbox"]')
    await toggle.setValue(true)
    
    // Only multi-cast book should show
    expect(wrapper.findAll('[data-testid="audiobook-card"]').length).toBe(1)
    
    // Add search term
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('Narrator')
    
    // Should still only show the multi-cast book
    expect(wrapper.findAll('[data-testid="audiobook-card"]').length).toBe(1)
    
    // Clear search
    await searchInput.setValue('')
    
    // Should still only show the multi-cast book
    expect(wrapper.findAll('[data-testid="audiobook-card"]').length).toBe(1)
  })
})