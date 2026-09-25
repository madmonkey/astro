import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AdminSignInForm from '~/components/admin/AdminSignInForm.vue'
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

const nuxtUiStubs = {
  UButton: {
    template: '<button type="button"><slot /></button>'
  }
}

const signIn = vi.fn()

describe('administrator content forms', () => {
  beforeEach(() => {
    window.localStorage.clear()
    signIn.mockReset()
    vi.stubGlobal('useAdministratorSession', () => ({ signIn }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

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
      global: { stubs: nuxtUiStubs },
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

  it('blocks sign-in for 15 minutes after three failed credential submissions', async () => {
    signIn.mockResolvedValue({
      failedCredentials: true,
      message:
        'We could not sign you in with those credentials. Check your email and password.',
      status: 'error'
    })

    const wrapper = mount(AdminSignInForm)
    await wrapper.get('#email').setValue('admin@example.com')
    await wrapper.get('#password').setValue('incorrect-password')

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await wrapper.get('form').trigger('submit')
      await flushPromises()
    }

    expect(signIn).toHaveBeenCalledTimes(3)
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Too many failed sign-in attempts. Try again in 15 minutes.'
    )
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()

    await wrapper.get('form').trigger('submit')

    expect(signIn).toHaveBeenCalledTimes(3)
    wrapper.unmount()
  })
})
