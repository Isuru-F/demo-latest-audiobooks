import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StarRating from '../StarRating.vue'

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    const wrapper = mount(StarRating, {
      props: {
        modelValue: 3
      }
    })
    
    const stars = wrapper.findAll('.star')
    expect(stars).toHaveLength(5)
  })

  it('displays correct rating', () => {
    const wrapper = mount(StarRating, {
      props: {
        modelValue: 4
      }
    })
    
    const filledStars = wrapper.findAll('.star-filled')
    expect(filledStars).toHaveLength(4)
  })

  it('emits update:modelValue when star is clicked', async () => {
    const wrapper = mount(StarRating, {
      props: {
        modelValue: 0
      }
    })
    
    const thirdStar = wrapper.findAll('.star')[2]
    await thirdStar.trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([3])
  })

  it('does not emit when readonly', async () => {
    const wrapper = mount(StarRating, {
      props: {
        modelValue: 3,
        readonly: true
      }
    })
    
    const firstStar = wrapper.findAll('.star')[0]
    await firstStar.trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
