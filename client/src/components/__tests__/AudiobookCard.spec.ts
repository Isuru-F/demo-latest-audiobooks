import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobookCard from '../AudiobookCard.vue'

describe('AudiobookCard', () => {
  const mockAudiobook = {
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
    duration_ms: 3600000,
  }

  it('renders correctly with string narrators', async () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook: mockAudiobook },
    })

    expect(wrapper.text()).toContain('Test Audiobook')
    expect(wrapper.text()).toContain('Test Author')
    expect(wrapper.text()).toContain('Narrator:')
    expect(wrapper.text()).toContain('Narrator 1, Narrator 2')
  })

  it('renders correctly with object narrators (handles error case)', async () => {
    const audiobook = {
      ...mockAudiobook,
      narrators: [{ name: 'Narrator 1' }, { name: 'Narrator 2' }] as any,
    }

    const wrapper = mount(AudiobookCard, {
      props: { audiobook },
    })

    expect(wrapper.text()).toContain('Test Audiobook')
    expect(wrapper.text()).toContain('Test Author')
    expect(wrapper.text()).toContain('Narrator:')
    expect(wrapper.text()).not.toContain('[object Object]')
  })

  it('displays hide button', () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook: mockAudiobook },
    })

    const hideBtn = wrapper.find('.hide-btn')
    expect(hideBtn.exists()).toBe(true)
    expect(hideBtn.attributes('aria-label')).toBe('Hide audiobook')
  })

  it('emits hide event when hide button is clicked', async () => {
    const wrapper = mount(AudiobookCard, {
      props: { audiobook: mockAudiobook },
    })

    const hideBtn = wrapper.find('.hide-btn')
    await hideBtn.trigger('click')

    expect(wrapper.emitted('hide')).toBeTruthy()
    expect(wrapper.emitted('hide')![0]).toEqual(['123'])
  })
})