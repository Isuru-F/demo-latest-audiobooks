import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GenreButton from '../GenreButton.vue'

describe('GenreButton', () => {
  it('renders the genre name correctly', () => {
    const genre = 'rock'
    const wrapper = mount(GenreButton, {
      props: {
        genre
      }
    })
    
    expect(wrapper.text()).toBe(genre)
    expect(wrapper.find('.genre-button').exists()).toBe(true)
  })

  it('displays the genre name', () => {
    const genre = 'hip-hop'
    const wrapper = mount(GenreButton, {
      props: {
        genre
      }
    })
    
    // Check that the component correctly renders the genre name
    expect(wrapper.text()).toBe(genre)
  })
})