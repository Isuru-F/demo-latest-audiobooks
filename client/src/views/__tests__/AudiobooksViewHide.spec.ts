import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AudiobooksView from '../AudiobooksView.vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/api', () => ({
  default: {
    getAudiobooks: vi.fn()
  }
}))

vi.mock('@/components/AudiobookCard.vue', () => ({
  default: {
    name: 'AudiobookCard',
    props: ['audiobook'],
    emits: ['hide'],
    template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)"></div>'
  }
}))

describe('AudiobooksView - Hide Functionality', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should hide audiobook when hide event is emitted', async () => {
    const wrapper = mount(AudiobooksView, {
      global: {
        stubs: {
          AudiobookCard: {
            props: ['audiobook'],
            emits: ['hide'],
            template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)">{{ audiobook.name }}</div>'
          }
        }
      }
    })

    // Set some test audiobooks in the store
    const store = (wrapper.vm as any).spotifyStore
    store.audiobooks = [
      { id: '1', name: 'Book 1', authors: [], images: [] },
      { id: '2', name: 'Book 2', authors: [], images: [] },
      { id: '3', name: 'Book 3', authors: [], images: [] }
    ]

    await wrapper.vm.$nextTick()

    // Initially, all 3 books should be visible
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(3)

    // Click the first card to emit hide event
    await wrapper.findAll('.audiobook-card-stub')[0].trigger('click')
    await wrapper.vm.$nextTick()

    // Now only 2 books should be visible
    expect(wrapper.findAll('.audiobook-card-stub').length).toBe(2)
    expect(wrapper.text()).toContain('Book 2')
    expect(wrapper.text()).toContain('Book 3')
    expect(wrapper.text()).not.toContain('Book 1')
  })

  it('should not persist hidden audiobooks on component remount', async () => {
    const wrapper1 = mount(AudiobooksView, {
      global: {
        stubs: {
          AudiobookCard: {
            props: ['audiobook'],
            emits: ['hide'],
            template: '<div class="audiobook-card-stub" @click="$emit(\'hide\', audiobook.id)"></div>'
          }
        }
      }
    })

    const store = (wrapper1.vm as any).spotifyStore
    store.audiobooks = [
      { id: '1', name: 'Book 1', authors: [], images: [] },
      { id: '2', name: 'Book 2', authors: [], images: [] }
    ]

    await wrapper1.vm.$nextTick()

    // Hide first book
    await wrapper1.findAll('.audiobook-card-stub')[0].trigger('click')
    await wrapper1.vm.$nextTick()
    expect(wrapper1.findAll('.audiobook-card-stub').length).toBe(1)

    // Unmount and remount component (simulating page refresh)
    wrapper1.unmount()

    const wrapper2 = mount(AudiobooksView, {
      global: {
        stubs: {
          AudiobookCard: {
            props: ['audiobook'],
            emits: ['hide'],
            template: '<div class="audiobook-card-stub"></div>'
          }
        }
      }
    })

    const store2 = (wrapper2.vm as any).spotifyStore
    store2.audiobooks = [
      { id: '1', name: 'Book 1', authors: [], images: [] },
      { id: '2', name: 'Book 2', authors: [], images: [] }
    ]

    await wrapper2.vm.$nextTick()

    // All books should be visible again (no persistence)
    expect(wrapper2.findAll('.audiobook-card-stub').length).toBe(2)
  })
})
