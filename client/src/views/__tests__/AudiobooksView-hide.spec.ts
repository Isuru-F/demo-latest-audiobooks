import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobooksView from '../AudiobooksView.vue'

const mockSpotifyStore = {
  audiobooks: [
    {
      id: '1',
      name: 'Audiobook 1',
      authors: [{ name: 'Author 1' }],
      narrators: ['Narrator 1'],
      images: [{ url: 'test1.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'https://spotify.com/1' },
      duration_ms: 3600000,
      total_chapters: 10,
      type: 'audiobook' as const,
      uri: 'spotify:audiobook:1',
      publisher: 'Publisher 1',
      description: 'Description 1',
      html_description: '<p>Description 1</p>',
      edition: 'Standard',
      explicit: false,
      languages: ['en'],
      media_type: 'audio'
    },
    {
      id: '2',
      name: 'Audiobook 2',
      authors: [{ name: 'Author 2' }],
      narrators: ['Narrator 2'],
      images: [{ url: 'test2.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'https://spotify.com/2' },
      duration_ms: 7200000,
      total_chapters: 15,
      type: 'audiobook' as const,
      uri: 'spotify:audiobook:2',
      publisher: 'Publisher 2',
      description: 'Description 2',
      html_description: '<p>Description 2</p>',
      edition: 'Standard',
      explicit: false,
      languages: ['en'],
      media_type: 'audio'
    }
  ],
  isLoading: false,
  error: null,
  fetchAudiobooks: vi.fn()
}

vi.mock('@/stores/spotify', () => ({
  useSpotifyStore: () => mockSpotifyStore
}))

vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    emits: ['hide'],
    template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)"></div>'
  }
}))

describe('AudiobooksView hide functionality', () => {
  it('should hide audiobook when hide event is emitted', async () => {
    const wrapper = mount(AudiobooksView)

    const cards = wrapper.findAll('.audiobook-card-stub')
    expect(cards).toHaveLength(2)

    await cards[0].trigger('click')

    await wrapper.vm.$nextTick()

    const updatedCards = wrapper.findAll('.audiobook-card-stub')
    expect(updatedCards).toHaveLength(1)
  })

  it('should not persist hidden state on page refresh', () => {
    const wrapper = mount(AudiobooksView)

    expect(wrapper.findAll('.audiobook-card-stub')).toHaveLength(2)
  })
})
