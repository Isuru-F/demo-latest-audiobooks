import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobookCard from '../AudiobookCard.vue'

describe('AudiobookCard', () => {
  it('emits hide event when hide button is clicked', async () => {
    const audiobook = {
      id: '123',
      name: 'Test Audiobook',
      authors: [{ name: 'Test Author' }],
      narrators: ['Narrator 1'],
      description: 'Test description',
      publisher: 'Test Publisher',
      images: [{ url: 'test.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'https://spotify.com' },
      release_date: '2023-01-01',
      media_type: 'audio',
      type: 'audiobook',
      uri: 'spotify:audiobook:123',
      total_chapters: 10,
      duration_ms: 3600000
    }

    const wrapper = mount(AudiobookCard, {
      props: { audiobook }
    })

    const hideBtn = wrapper.find('.hide-btn')
    expect(hideBtn.exists()).toBe(true)
    
    await hideBtn.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('hide')
    expect(wrapper.emitted('hide')?.[0]).toEqual(['123'])
  })

  it('shows hide button with correct accessibility label', () => {
    const audiobook = {
      id: '123',
      name: 'Test Audiobook',
      authors: [{ name: 'Test Author' }],
      narrators: ['Narrator 1'],
      description: 'Test description',
      publisher: 'Test Publisher',
      images: [{ url: 'test.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'https://spotify.com' },
      release_date: '2023-01-01',
      media_type: 'audio',
      type: 'audiobook',
      uri: 'spotify:audiobook:123',
      total_chapters: 10,
      duration_ms: 3600000
    }

    const wrapper = mount(AudiobookCard, {
      props: { audiobook }
    })

    const hideBtn = wrapper.find('.hide-btn')
    expect(hideBtn.attributes('aria-label')).toBe('Hide audiobook')
  })

  it('renders correctly with string narrators', async () => {
    const audiobook = {
      id: '123',
      name: 'Test Audiobook',
      authors: [{ name: 'Test Author' }],
      narrators: ['Narrator 1', 'Narrator 2'],
      description: 'Test description',
      publisher: 'Test Publisher',
      images: [{ url: 'test.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'https://spotify.com' },
      release_date: '2023-01-01',
      media_type: 'audio',
      type: 'audiobook',
      uri: 'spotify:audiobook:123',
      total_chapters: 10,
      duration_ms: 3600000
    }

    const wrapper = mount(AudiobookCard, {
      props: { audiobook }
    })

    expect(wrapper.text()).toContain('Test Audiobook')
    expect(wrapper.text()).toContain('Test Author')
    expect(wrapper.text()).toContain('Narrator:')
    expect(wrapper.text()).toContain('Narrator 1, Narrator 2')
  })

  it('renders correctly with object narrators (handles error case)', async () => {
    // This test simulates the bug where narrators might be objects instead of strings
    const audiobook = {
      id: '123',
      name: 'Test Audiobook',
      authors: [{ name: 'Test Author' }],
      narrators: [{ name: 'Narrator 1' }, { name: 'Narrator 2' }] as any,
      description: 'Test description',
      publisher: 'Test Publisher',
      images: [{ url: 'test.jpg', height: 300, width: 300 }],
      external_urls: { spotify: 'https://spotify.com' },
      release_date: '2023-01-01',
      media_type: 'audio',
      type: 'audiobook',
      uri: 'spotify:audiobook:123',
      total_chapters: 10,
      duration_ms: 3600000
    }

    const wrapper = mount(AudiobookCard, {
      props: { audiobook }
    })

    expect(wrapper.text()).toContain('Test Audiobook')
    expect(wrapper.text()).toContain('Test Author')
    expect(wrapper.text()).toContain('Narrator:')
    // The component should now handle object narrators without showing [object Object]
    expect(wrapper.text()).not.toContain('[object Object]')
  })
})