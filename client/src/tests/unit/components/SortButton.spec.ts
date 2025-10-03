import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SortButton from '@/components/SortButton.vue'

describe('SortButton', () => {
  const mockOptions = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Date (Newest)', value: 'date-desc' },
    { label: 'Date (Oldest)', value: 'date-asc' }
  ]

  it('renders sort options correctly', () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: ''
      }
    })

    const select = wrapper.find('select')
    const options = wrapper.findAll('option')

    expect(select.exists()).toBe(true)
    expect(options).toHaveLength(mockOptions.length + 1) // +1 for placeholder
  })

  it('displays placeholder when no option is selected', () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: '',
        placeholder: 'Sort by...'
      }
    })

    const firstOption = wrapper.find('option')
    expect(firstOption.text()).toBe('Sort by...')
    expect(firstOption.element.value).toBe('')
  })

  it('displays custom placeholder', () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: '',
        placeholder: 'Choose sort order'
      }
    })

    const firstOption = wrapper.find('option')
    expect(firstOption.text()).toBe('Choose sort order')
  })

  it('emits update:modelValue when option is selected', async () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: ''
      }
    })

    const select = wrapper.find('select')
    await select.setValue('name-asc')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['name-asc'])
  })

  it('highlights selected option', () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: 'name-desc'
      }
    })

    const select = wrapper.find('select')
    expect(select.element.value).toBe('name-desc')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: ''
      }
    })

    const select = wrapper.find('select')
    expect(select.attributes('aria-label')).toBe('Sort options')
  })

  it('renders all option labels correctly', () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: ''
      }
    })

    const options = wrapper.findAll('option')
    
    // Skip first option (placeholder)
    expect(options[1].text()).toBe('Name (A-Z)')
    expect(options[2].text()).toBe('Name (Z-A)')
    expect(options[3].text()).toBe('Date (Newest)')
    expect(options[4].text()).toBe('Date (Oldest)')
  })

  it('renders all option values correctly', () => {
    const wrapper = mount(SortButton, {
      props: {
        options: mockOptions,
        modelValue: ''
      }
    })

    const options = wrapper.findAll('option')
    
    // Skip first option (placeholder)
    expect(options[1].element.value).toBe('name-asc')
    expect(options[2].element.value).toBe('name-desc')
    expect(options[3].element.value).toBe('date-desc')
    expect(options[4].element.value).toBe('date-asc')
  })
})
