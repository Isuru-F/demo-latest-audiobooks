import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobookCard from '../AudiobookCard.vue'

describe('AudiobookCard hide functionality', () => {
  const mockAudiobook = {
    id: '123',
    name: 'Test Audiobook',
    authors: [{ name: 'Test Author' }],
    narrators: ['Test Narrator'],
    images: [{ url: 'test.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com' },
    duration_ms: 3600000,
    total_chapters: 10,
    type: 'audiobook' as const,
    uri: 'spotify:audiobook:123',
    publisher: 'Test Publisher',
    description: 'Test description',
    html_description: '<p>Test description</p>',
    edition: 'Standard',
    explicit: false,
    languages: ['en'],
    media_type: 'audio'
  }

  it('should emit hide event when hide button is clicked', async () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook: mockAudiobook }
    })

    const hideBtn = wrapper.find('.hide-btn')
    expect(hideBtn.exists()).toBe(true)

    await hideBtn.trigger('click')

    expect(wrapper.emitted('hide')).toBeTruthy()
    expect(wrapper.emitted('hide')?.[0]).toEqual(['123'])
  })

  it('should render hide button with correct attributes', () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook: mockAudiobook }
    })

    const hideBtn = wrapper.find('.hide-btn')
    expect(hideBtn.text()).toBe('×')
    expect(hideBtn.attributes('title')).toBe('Hide this audiobook')
  })
})
