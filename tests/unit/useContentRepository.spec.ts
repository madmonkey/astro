import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContentRepository } from '~/composables/useContentRepository'

const activeTopic = {
  created_at: '2026-09-24T00:00:00.000Z',
  id: 'topic-1',
  is_active: true,
  name: 'Moon Phases',
  slug: 'moon-phases',
  updated_at: '2026-09-24T00:00:00.000Z'
}

const activeContent = {
  body: '# Full Moon',
  created_at: '2026-09-24T00:00:00.000Z',
  id: 'content-1',
  is_active: true,
  slug: 'full-moon',
  title: 'Full Moon',
  topic_id: activeTopic.id,
  updated_at: '2026-09-24T00:00:00.000Z'
}

function mockSupabase(result: {
  data: unknown
  error: { message: string } | null
}) {
  const query = {
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    order: vi.fn(),
    select: vi.fn()
  }

  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.order.mockResolvedValue(result)
  query.maybeSingle.mockResolvedValue(result)

  vi.stubGlobal('useSupabase', () => ({
    from: vi.fn(() => query)
  }))
}

describe('useContentRepository', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns active topics when the database query succeeds', async () => {
    mockSupabase({ data: [activeTopic], error: null })

    await expect(useContentRepository().getActiveTopics()).resolves.toEqual({
      data: [activeTopic],
      error: null
    })
  })

  it('returns a retryable error when topics cannot be loaded', async () => {
    mockSupabase({ data: null, error: { message: 'Network unavailable' } })

    await expect(useContentRepository().getActiveTopics()).resolves.toEqual({
      data: null,
      error: { message: 'Topics could not be loaded. Please try again.' }
    })
  })

  it('returns an unavailable error when an active topic does not exist', async () => {
    mockSupabase({ data: null, error: null })

    await expect(
      useContentRepository().getActiveTopicBySlug('missing-topic')
    ).resolves.toEqual({
      data: null,
      error: { message: 'This topic is unavailable.' }
    })
  })

  it('returns an empty content list for a topic with no active content', async () => {
    mockSupabase({ data: [], error: null })

    await expect(
      useContentRepository().getActiveContentByTopic(activeTopic.id)
    ).resolves.toEqual({
      data: [],
      error: null
    })
  })

  it('returns active content when the database query succeeds', async () => {
    mockSupabase({ data: activeContent, error: null })

    await expect(
      useContentRepository().getActiveContentBySlug(activeContent.slug)
    ).resolves.toEqual({
      data: activeContent,
      error: null
    })
  })
})
