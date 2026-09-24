import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ContentForm from '~/components/admin/ContentForm.vue'
import TopicForm from '~/components/admin/TopicForm.vue'

const topics = [
  {
    created_at: '2026-09-24T00:00:00.000Z',
    id: '10000000-0000-0000-0000-000000000001',
    is_active: true,
    name: 'Moon Phases',
    slug: 'moon-phases',
    updated_at: '2026-09-24T00:00:00.000Z'
  }
]

describe('administrator content forms', () => {
  it('emits normalized topic values on a valid save', async () => {
    const wrapper = mount(TopicForm)

    await wrapper.get('#topic-name').setValue(' Moon Phases ')
    await wrapper.get('#topic-slug').setValue(' MOON-PHASES ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('save')).toEqual([
      [
        {
          is_active: false,
          name: 'Moon Phases',
          slug: 'moon-phases'
        }
      ]
    ])
  })

  it('retains invalid topic values and presents field-level errors', async () => {
    const wrapper = mount(TopicForm)

    await wrapper.get('#topic-name').setValue('   ')
    await wrapper.get('#topic-slug').setValue('Not a slug')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Enter a topic name.')
    expect(wrapper.text()).toContain(
      'Use lowercase letters, numbers, and single hyphens in the URL slug.'
    )
    expect((wrapper.get('#topic-name').element as HTMLInputElement).value).toBe(
      '   '
    )
    expect((wrapper.get('#topic-slug').element as HTMLInputElement).value).toBe(
      'Not a slug'
    )
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('retains invalid Markdown content values and presents field-level errors', async () => {
    const wrapper = mount(ContentForm, {
      props: { topics }
    })

    await wrapper.get('#content-title').setValue('  ')
    await wrapper.get('#content-slug').setValue('Moon Notes')
    await wrapper.get('#content-body').setValue('   ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Enter a content title.')
    expect(wrapper.text()).toContain('Enter Markdown content.')
    expect(wrapper.text()).toContain(
      'Use lowercase letters, numbers, and single hyphens in the URL slug.'
    )
    expect(
      (wrapper.get('#content-title').element as HTMLInputElement).value
    ).toBe('  ')
    expect(
      (wrapper.get('#content-body').element as HTMLTextAreaElement).value
    ).toBe('   ')
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('shows a repository duplicate error beside the topic slug field', () => {
    const wrapper = mount(TopicForm, {
      props: {
        errors: {
          slug: 'Choose a URL slug that is not already in use.'
        }
      }
    })

    expect(wrapper.get('#topic-slug-error').text()).toBe(
      'Choose a URL slug that is not already in use.'
    )
    expect(wrapper.get('#topic-slug').attributes('aria-invalid')).toBe('true')
  })
})
