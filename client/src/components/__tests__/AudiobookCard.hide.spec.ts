import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobookCard from '../AudiobookCard.vue'

describe('AudiobookCard - Hide Functionality', () => {
  const audiobook = {
    id: '1',
    name: 'Test Audiobook',
    authors: [{ name: 'Test Author' }],
    narrators: [{ name: 'Test Narrator' }],
    duration_ms: 3600000,
    total_chapters: 10,
    images: [{ url: 'test.jpg', height: 300, width: 300 }],
    external_urls: { spotify: 'https://spotify.com' },
    publisher: 'Test Publisher',
    description: 'Test Description',
    type: 'audiobook',
    uri: 'spotify:audiobook:123',
    release_date: '2024-01-01',
    media_type: 'audio',
  }

  it('renders hide button', () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook }
    })

    const hideBtn = wrapper.find('.hide-btn')
    expect(hideBtn.exists()).toBe(true)
  })

  it('emits hide event when hide button is clicked', async () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook }
    })

    const hideBtn = wrapper.find('.hide-btn')
    await hideBtn.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('hide')
    expect(wrapper.emitted('hide')).toHaveLength(1)
  })

  it('hide button has proper aria-label for accessibility', () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook }
    })

    const hideBtn = wrapper.find('.hide-btn')
    expect(hideBtn.attributes('aria-label')).toBe('Hide audiobook')
  })
})
