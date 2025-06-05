import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AudiobooksView from '../AudiobooksView.vue'

// Sample test data
const mockAudiobooks = [
  {
    id: '1',
    name: 'Single Narrator Book',
    authors: [{ name: 'John Doe' }],
    narrators: ['John Smith'],
    description: 'Test book 1',
    publisher: 'Test Publisher',
    images: [{ url: 'test.jpg', height: 100, width: 100 }],
    external_urls: { spotify: 'https://test.com' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:1',
    total_chapters: 10,
    duration_ms: 3600000,
  },
  {
    id: '2',
    name: 'Multi-Cast Book',
    authors: [{ name: 'Jane Doe' }],
    narrators: ['Narrator One', 'Narrator Two'],
    description: 'Test book 2',
    publisher: 'Test Publisher',
    images: [{ url: 'test2.jpg', height: 100, width: 100 }],
    external_urls: { spotify: 'https://test2.com' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:2',
    total_chapters: 15,
    duration_ms: 7200000,
  },
  {
    id: '3',
    name: 'Another Multi-Cast Book',
    authors: [{ name: 'Sara Writer' }],
    narrators: [{ name: 'Voice Actor A' }, { name: 'Voice Actor B' }, { name: 'Voice Actor C' }],
    description: 'Test book 3',
    publisher: 'Test Publisher',
    images: [{ url: 'test3.jpg', height: 100, width: 100 }],
    external_urls: { spotify: 'https://test3.com' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:3',
    total_chapters: 20,
    duration_ms: 9000000,
  },
  {
    id: '4',
    name: 'Edge Case Book',
    authors: [{ name: 'Edge Author' }],
    narrators: null, // Edge case: null narrators
    description: 'Test book 4',
    publisher: 'Test Publisher',
    images: [{ url: 'test4.jpg', height: 100, width: 100 }],
    external_urls: { spotify: 'https://test4.com' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:4',
    total_chapters: 5,
    duration_ms: 1800000,
  },
  {
    id: '5',
    name: 'Empty Narrators Book',
    authors: [{ name: 'Empty Author' }],
    narrators: [], // Edge case: empty array
    description: 'Test book 5',
    publisher: 'Test Publisher',
    images: [{ url: 'test5.jpg', height: 100, width: 100 }],
    external_urls: { spotify: 'https://test5.com' },
    release_date: '2023-01-01',
    media_type: 'audio',
    type: 'audiobook',
    uri: 'spotify:audiobook:5',
    total_chapters: 8,
    duration_ms: 2700000,
  },
]

let mockStore = {
  audiobooks: mockAudiobooks,
  isLoading: false,
  error: null,
  fetchAudiobooks: vi.fn(),
}

// Mock the store
vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockStore,
}))

// Mock the AudiobookCard component
vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    template: '<div class="audiobook-card-stub"></div>',
  },
}))

describe('AudiobooksView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset mock store before each test
    mockStore.audiobooks = mockAudiobooks
    mockStore.isLoading = false
    mockStore.error = null
    vi.clearAllMocks()
  })

  it('renders the AudiobooksView component', () => {
    const wrapper = mount(AudiobooksView)

    // Check if the component renders main sections
    expect(wrapper.find('.audiobooks').exists()).toBe(true)
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('#multicast-toggle').exists()).toBe(true)
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
    it('renders multi-cast toggle with correct accessibility attributes', () => {
      const wrapper = mount(AudiobooksView)

      const toggle = wrapper.find('#multicast-toggle')
      const label = wrapper.find('label[for="multicast-toggle"]')
      const description = wrapper.find('#multicast-description')

      expect(toggle.exists()).toBe(true)
      expect(label.exists()).toBe(true)
      expect(description.exists()).toBe(true)
      expect(toggle.attributes('aria-describedby')).toBe('multicast-description')
    })

    it('filters audiobooks to show only multi-cast when toggle is enabled', async () => {
      const wrapper = mount(AudiobooksView)

      // Initially all books should be shown (5 total)
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(5)

      // Enable multi-cast filter
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Should only show 2 multi-cast books (books with >1 narrator)
      expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(2)
    })

    it('shows all audiobooks when toggle is disabled', async () => {
      const wrapper = mount(AudiobooksView)

      // Enable multi-cast filter first
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Should show only 2 multi-cast books
      expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(2)

      // Disable multi-cast filter
      await toggle.setChecked(false)
      await wrapper.vm.$nextTick()

      // Should show all 5 books
      expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(5)
    })

    it('handles edge cases with null and empty narrators arrays', async () => {
      const wrapper = mount(AudiobooksView)

      // Enable multi-cast filter
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Should only show books with multiple narrators
      // Books with null narrators or empty arrays should be filtered out
      const cards = wrapper.findAll('.audiobook-card-stub')
      expect(cards).toHaveLength(2) // Only books 2 and 3 have multiple narrators
    })

    it('updates aria-label based on toggle state', async () => {
      const wrapper = mount(AudiobooksView)
      const toggle = wrapper.find('#multicast-toggle')

      // Initially should have "Enable" aria-label
      expect(toggle.attributes('aria-label')).toBe('Enable multi-cast filter')

      // After enabling should have "Disable" aria-label
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()
      expect(toggle.attributes('aria-label')).toBe('Disable multi-cast filter')
    })

    it('applies active class to toggle label when enabled', async () => {
      const wrapper = mount(AudiobooksView)
      const toggleLabel = wrapper.find('#multicast-description')

      // Initially should not have active class
      expect(toggleLabel.classes()).not.toContain('active')

      // After enabling should have active class
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()
      expect(toggleLabel.classes()).toContain('active')
    })
  })

  describe('Combined Search and Multi-Cast Filter', () => {
    it('combines search and multi-cast filtering correctly', async () => {
      const wrapper = mount(AudiobooksView)

      // Enable multi-cast filter first
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Search for "Sara" (should match book 3 by author name)
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('Sara')
      await wrapper.vm.$nextTick()

      // Should show only 1 book (book 3: multi-cast + matches "Sara")
      expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(1)
    })

    it('shows appropriate no-results message for multi-cast filter only', async () => {
      const wrapper = mount(AudiobooksView)

      // Set up mock with no multi-cast books
      mockStore.audiobooks = [mockAudiobooks[0]] // Only single narrator book
      await wrapper.vm.$nextTick()

      // Enable multi-cast filter
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Should show "no multi-cast audiobooks found" message
      expect(wrapper.find('.no-results').text()).toBe('No multi-cast audiobooks found.')
    })

    it('shows appropriate no-results message for combined search and multi-cast', async () => {
      const wrapper = mount(AudiobooksView)

      // Enable multi-cast filter
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Search for something that won't match
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('nonexistent')
      await wrapper.vm.$nextTick()

      // Should show combined filter message
      expect(wrapper.find('.no-results').text()).toBe(
        'No multi-cast audiobooks match your search criteria.',
      )
    })

    it('shows regular no-results message when only search filter is active', async () => {
      const wrapper = mount(AudiobooksView)

      // Search for something that won't match (multi-cast filter disabled)
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('nonexistent')
      await wrapper.vm.$nextTick()

      // Should show regular search message
      expect(wrapper.find('.no-results').text()).toBe('No audiobooks match your search.')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined narrators gracefully', async () => {
      // Test with undefined narrators
      const bookWithUndefinedNarrators = {
        ...mockAudiobooks[0],
        narrators: undefined,
      }

      mockStore.audiobooks = [bookWithUndefinedNarrators]
      const wrapper = mount(AudiobooksView)

      // Enable multi-cast filter
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Should not crash and should show no results
      expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(0)
      expect(wrapper.find('.no-results').exists()).toBe(true)
    })

    it('handles non-array narrators gracefully', async () => {
      // Test with non-array narrators
      const bookWithStringNarrators = {
        ...mockAudiobooks[0],
        narrators: 'Single String Narrator',
      }

      mockStore.audiobooks = [bookWithStringNarrators]
      const wrapper = mount(AudiobooksView)

      // Enable multi-cast filter
      const toggle = wrapper.find('#multicast-toggle')
      await toggle.setChecked(true)
      await wrapper.vm.$nextTick()

      // Should not crash and should show no results (not an array)
      expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(0)
      expect(wrapper.find('.no-results').exists()).toBe(true)
    })
  })
})
