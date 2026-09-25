import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ContentDetail from '~/components/content/ContentDetail.vue'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import ContentSummary from '~/components/content/ContentSummary.vue'
import TopicList from '~/components/content/TopicList.vue'

const topic = {
  created_at: '2026-09-24T00:00:00.000Z',
  id: 'topic-1',
  is_active: true,
  name: 'Moon Phases',
  slug: 'moon-phases',
  updated_at: '2026-09-24T00:00:00.000Z'
}

const content = {
  body: '# Full Moon\n\nLearn more about the [moon](https://example.com).',
  created_at: '2026-09-24T00:00:00.000Z',
  id: 'content-1',
  is_active: true,
  slug: 'full-moon',
  title: 'Full Moon',
  topic_id: topic.id,
  updated_at: '2026-09-24T00:00:00.000Z'
}

const nuxtLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
}

describe('public content states', () => {
  it('shows a loading state for public content', () => {
    const wrapper = mount(ContentState, {
      props: {
        description: 'Fetching the latest astrology content.',
        title: 'Loading topics'
      }
    })

    expect(wrapper.get('[aria-live="polite"]').text()).toContain(
      'Loading topics'
    )
    expect(wrapper.text()).toContain('Fetching the latest astrology content.')
  })

  it('shows an empty state when a topic has no published content', () => {
    const wrapper = mount(ContentState, {
      props: {
        description: 'Check back soon for new guidance.',
        title: 'No published content yet'
      }
    })

    expect(wrapper.text()).toContain('No published content yet')
    expect(wrapper.text()).toContain('Check back soon for new guidance.')
  })

  it('announces a retryable error and emits retry on request', async () => {
    const wrapper = mount(ContentError, {
      props: {
        message: 'Topics could not be loaded. Please try again.'
      }
    })

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Topics could not be loaded. Please try again.'
    )

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('lists active topics with public topic links', () => {
    const wrapper = mount(TopicList, {
      global: {
        stubs: { NuxtLink: nuxtLinkStub }
      },
      props: {
        topics: [topic]
      }
    })

    expect(wrapper.get('a').attributes('href')).toBe('/topics/moon-phases')
    expect(wrapper.text()).toContain('Moon Phases')
  })

  it('shows a text summary and article link for published content', () => {
    const wrapper = mount(ContentSummary, {
      global: {
        stubs: { NuxtLink: nuxtLinkStub }
      },
      props: {
        content,
        topicSlug: topic.slug
      }
    })

    expect(wrapper.text()).toContain('Learn more about the moon.')
    expect(wrapper.get('a').attributes('href')).toBe(
      '/topics/moon-phases/full-moon'
    )
  })

  it('renders sanitized Markdown without authored raw HTML', () => {
    const wrapper = mount(ContentDetail, {
      props: {
        content: {
          ...content,
          body: '# Full Moon\n\n<script>window.alert("unsafe")</script>'
        }
      }
    })

    expect(wrapper.get('.markdown-content h1').text()).toBe('Full Moon')
    expect(wrapper.html()).not.toContain('<script')
    expect(wrapper.html()).not.toContain('window.alert')
  })

  it('renders safe Markdown images and excludes unsafe image sources', () => {
    const wrapper = mount(ContentDetail, {
      props: {
        content: {
          ...content,
          body: [
            '![Moon](https://images.example.com/moon.jpg "Moon phase")',
            '![Unsafe](javascript:window.alert("unsafe"))'
          ].join('\n\n')
        }
      }
    })

    expect(wrapper.get('.markdown-content img').attributes()).toMatchObject({
      alt: 'Moon',
      src: 'https://images.example.com/moon.jpg',
      title: 'Moon phase'
    })
    expect(wrapper.html()).not.toContain('javascript:')
    expect(wrapper.html()).not.toContain('window.alert')
  })

  it('renders standard Markdown table output', () => {
    const wrapper = mount(ContentDetail, {
      props: {
        content: {
          ...content,
          body: [
            '| Phase | Focus |',
            '| --- | --- |',
            '| New Moon | Intentions |'
          ].join('\n')
        }
      }
    })

    expect(wrapper.get('.markdown-content table').text()).toContain('New Moon')
    expect(wrapper.get('.markdown-content th').text()).toBe('Phase')
  })
})
