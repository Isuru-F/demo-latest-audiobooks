import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AudiobooksView from '../src/views/AudiobooksView.vue';
import { useSpotifyStore } from '../src/stores/spotify';
import { nextTick } from 'vue';

// Mock the store
vi.mock('../src/stores/spotify', () => {
  return {
    useSpotifyStore: vi.fn(() => ({
      audiobooks: [
        {
          id: '1',
          name: 'Test Book 1',
          authors: [{ name: 'Author 1' }],
          narrators: ['Narrator 1'],
          description: 'Description 1',
          publisher: 'Publisher 1',
          images: [{ url: 'image1.jpg', height: 300, width: 300 }],
          external_urls: { spotify: 'https://spotify.com/1' },
          release_date: '2023-01-01',
          media_type: 'audio',
          type: 'audiobook',
          uri: 'spotify:audiobook:1',
          total_chapters: 10,
          duration_ms: 3600000
        },
        {
          id: '2',
          name: 'Test Book 2',
          authors: [{ name: 'Author 2' }],
          narrators: ['Narrator 2A', 'Narrator 2B'],
          description: 'Description 2',
          publisher: 'Publisher 2',
          images: [{ url: 'image2.jpg', height: 300, width: 300 }],
          external_urls: { spotify: 'https://spotify.com/2' },
          release_date: '2023-01-02',
          media_type: 'audio',
          type: 'audiobook',
          uri: 'spotify:audiobook:2',
          total_chapters: 12,
          duration_ms: 4200000
        },
        {
          id: '3',
          name: 'Test Book 3',
          authors: [{ name: 'Author 3' }],
          narrators: ['Narrator 3A', 'Narrator 3B', 'Narrator 3C'],
          description: 'Description 3',
          publisher: 'Publisher 3',
          images: [{ url: 'image3.jpg', height: 300, width: 300 }],
          external_urls: { spotify: 'https://spotify.com/3' },
          release_date: '2023-01-03',
          media_type: 'audio',
          type: 'audiobook',
          uri: 'spotify:audiobook:3',
          total_chapters: 15,
          duration_ms: 5400000
        }
      ],
      isLoading: false,
      error: null,
      fetchAudiobooks: vi.fn()
    }))
  };
});

describe('AudiobooksView component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('filters audiobooks with multiple narrators when Multi-Cast Only is toggled', async () => {
    const wrapper = mount(AudiobooksView);

    // Check that we initially have 3 audiobooks
    let audiobookCards = wrapper.findAll('.audiobook-card');
    expect(audiobookCards.length).toBe(3);

    // Toggle multi-cast filter
    const toggleInput = wrapper.find('#multicast-toggle');
    await toggleInput.setValue(true);

    // Check that only books with multiple narrators are shown (2 books)
    audiobookCards = wrapper.findAll('.audiobook-card');
    expect(audiobookCards.length).toBe(2);

    // Check specific books that should be displayed
    const titles = wrapper.findAll('.audiobook-title');
    const titleTexts = titles.map(title => title.text());
    expect(titleTexts).toContain('Test Book 2');
    expect(titleTexts).toContain('Test Book 3');
    expect(titleTexts).not.toContain('Test Book 1');

    // Toggle filter off
    await toggleInput.setValue(false);

    // Check that all books are shown again
    audiobookCards = wrapper.findAll('.audiobook-card');
    expect(audiobookCards.length).toBe(3);
  });

  it('persists multi-cast filter while searching', async () => {
    const wrapper = mount(AudiobooksView);

    // Toggle multi-cast filter on
    const toggleInput = wrapper.find('#multicast-toggle');
    await toggleInput.setValue(true);
    await nextTick();

    // Enter search text that should match all books
    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('Test');
    await nextTick();

    // Should still show only multi-cast books (2)
    const audiobookCards = wrapper.findAll('.audiobook-card');
    expect(audiobookCards.length).toBe(2);

    // Clear search
    await searchInput.setValue('');
    await nextTick();

    // Should still show only multi-cast books (2)
    const audiobookCardsAfterClear = wrapper.findAll('.audiobook-card');
    expect(audiobookCardsAfterClear.length).toBe(2);
  });

  it('styling and accessibility of multi-cast toggle is correct', async () => {
    const wrapper = mount(AudiobooksView);
    
    // Check if toggle has appropriate aria-label
    const toggleInput = wrapper.find('#multicast-toggle');
    expect(toggleInput.attributes('aria-label')).toBe('Filter for multi-cast narrators only');
    
    // Check initial state styling
    const toggleContainer = wrapper.find('.toggle-container');
    expect(toggleContainer.exists()).toBe(true);
    
    // Toggle on and check active styling
    await toggleInput.setValue(true);
    await nextTick();
    
    // Check that filter works with search queries
    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('Author 3');
    await nextTick();
    
    // Should show only the multi-cast book by Author 3
    const audiobookCards = wrapper.findAll('.audiobook-card');
    expect(audiobookCards.length).toBe(1);
    
    const titles = wrapper.findAll('.audiobook-title');
    expect(titles.length).toBe(1);
    expect(titles[0].text()).toBe('Test Book 3');
  });
});