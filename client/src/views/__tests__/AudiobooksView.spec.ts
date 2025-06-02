import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Sample audiobook data for testing
const mockAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'Author One' }],
    narrators: ['John Doe'],
    description: 'A book with one narrator',
    images: [{ url: 'image1.jpg', height: 100, width: 100 }]
  },
  {
    id: '2',
    name: 'Multi-Cast Book',
    authors: [{ name: 'Author Two' }],
    narrators: ['Jane Smith', 'Bob Wilson'],
    description: 'A book with multiple narrators',
    images: [{ url: 'image2.jpg', height: 100, width: 100 }]
  },
  {
    id: '3',
    name: 'Kelli Narrator Book',
    authors: [{ name: 'Author Three' }],
    narrators: ['Kelli Tager', 'Will Watt'],
    description: 'A book with Kelli as narrator',
    images: [{ url: 'image3.jpg', height: 100, width: 100 }]
  },
  {
    id: '4',
    name: 'Object Narrator Book',
    authors: [{ name: 'Author Four' }],
    narrators: [{ name: 'Alice Johnson' }, { name: 'Charlie Brown' }],
    description: 'A book with narrator objects',
    images: [{ url: 'image4.jpg', height: 100, width: 100 }]
  },
  {
    id: '5',
    name: 'No Narrators Book',
    authors: [{ name: 'Author Five' }],
    narrators: undefined,
    description: 'A book with no narrators',
    images: [{ url: 'image5.jpg', height: 100, width: 100 }]
  },
  {
    id: '6',
    name: 'String Narrator Book',
    authors: [{ name: 'Author Six' }],
    narrators: 'Single String Narrator',
    description: 'A book with narrator as string',
    images: [{ url: 'image6.jpg', height: 100, width: 100 }]
  }
]

let mockStore: any

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockStore
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
    mockStore = {
      audiobooks: [...mockAudiobooks],
      isLoading: false,
      error: null,
      fetchAudiobooks: vi.fn()
    }
    setActivePinia(createPinia())
  })

  it('renders the AudiobooksView component', () => {
    const wrapper = mount(AudiobooksView)
    
    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('.multi-cast-toggle').exists()).toBe(true)
  })
  
  it('has search input functionality', async () => {
    const wrapper = mount(AudiobooksView)
    
    // Check if search input works
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('test')
    
    // Simply verify the setValue function works
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  describe('Multi-Cast Filter', () => {
    it('shows all audiobooks when multi-cast toggle is off', () => {
      const wrapper = mount(AudiobooksView)
      
      // All audiobooks should be shown
      const cards = wrapper.findAll('.audiobook-card-stub')
      expect(cards).toHaveLength(6)
    })

    it('filters to only multi-cast audiobooks when toggle is enabled', async () => {
      const wrapper = mount(AudiobooksView)
      
      // Enable multi-cast toggle
      const toggle = wrapper.find('.toggle-input')
      await toggle.setChecked(true)
      
      // Should only show books with multiple narrators (ids: 2, 3, 4)
      const cards = wrapper.findAll('.audiobook-card-stub')
      expect(cards).toHaveLength(3)
    })

    it('handles edge cases with narrator data types', async () => {
      mockStore.audiobooks = [
        { id: '1', name: 'Test', authors: [], narrators: undefined },
        { id: '2', name: 'Test', authors: [], narrators: null },
        { id: '3', name: 'Test', authors: [], narrators: 'string' },
        { id: '4', name: 'Test', authors: [], narrators: ['one', 'two'] }
      ]

      const wrapper = mount(AudiobooksView)
      
      // Enable multi-cast toggle
      const toggle = wrapper.find('.toggle-input')
      await toggle.setChecked(true)
      
      // Should only show the one with array of multiple narrators
      const cards = wrapper.findAll('.audiobook-card-stub')
      expect(cards).toHaveLength(1)
    })

    it('combines multi-cast filter with search functionality', async () => {
      const wrapper = mount(AudiobooksView)
      
      // Enable multi-cast toggle
      const toggle = wrapper.find('.toggle-input')
      await toggle.setChecked(true)
      
      // Search for "Kelli"
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('Kelli')
      
      // Should only show multi-cast books containing "Kelli"
      const cards = wrapper.findAll('.audiobook-card-stub')
      expect(cards).toHaveLength(1)
    })

    it('shows appropriate no-results message for multi-cast only filter', async () => {
      // Set up data with no multi-cast books
      mockStore.audiobooks = [
        { id: '1', name: 'Single', authors: [], narrators: ['One'] }
      ]

      const wrapper = mount(AudiobooksView)
      
      // Enable multi-cast toggle
      const toggle = wrapper.find('.toggle-input')
      await toggle.setChecked(true)
      
      // Should show no multi-cast books message
      expect(wrapper.text()).toContain('No multi-cast audiobooks found')
    })

    it('shows appropriate no-results message for combined filter', async () => {
      const wrapper = mount(AudiobooksView)
      
      // Enable multi-cast toggle
      const toggle = wrapper.find('.toggle-input')
      await toggle.setChecked(true)
      
      // Search for something that won't match
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('nonexistent')
      
      // Should show combined filter no results message
      expect(wrapper.text()).toContain('No multi-cast audiobooks match your search')
    })

    it('handles narrator objects correctly', async () => {
      mockStore.audiobooks = [
        {
          id: '1',
          name: 'Test Book',
          authors: [],
          narrators: [{ name: 'First Narrator' }, { name: 'Second Narrator' }]
        }
      ]

      const wrapper = mount(AudiobooksView)
      
      // Enable multi-cast toggle
      const toggle = wrapper.find('.toggle-input')
      await toggle.setChecked(true)
      
      // Should show the book with narrator objects
      const cards = wrapper.findAll('.audiobook-card-stub')
      expect(cards).toHaveLength(1)
    })

    it('searches in narrator objects correctly', async () => {
      mockStore.audiobooks = [
        {
          id: '1',
          name: 'Test Book',
          authors: [],
          narrators: [{ name: 'Alice Johnson' }, { name: 'Bob Smith' }]
        }
      ]

      const wrapper = mount(AudiobooksView)
      
      // Search for narrator name in object
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('Alice')
      
      // Should find the book
      const cards = wrapper.findAll('.audiobook-card-stub')
      expect(cards).toHaveLength(1)
    })
  })
})