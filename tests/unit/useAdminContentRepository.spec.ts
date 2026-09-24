import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdminContentRepository } from '~/composables/useAdminContentRepository'
import type { ContentItem, Topic } from '~/types/content'

const topic: Topic = {
  created_at: '2026-09-24T00:00:00.000Z',
  id: '10000000-0000-0000-0000-000000000001',
  is_active: false,
  name: 'Moon Phases',
  slug: 'moon-phases',
  updated_at: '2026-09-24T00:00:00.000Z'
}

const content: ContentItem = {
  body: 'Observe the moon.',
  created_at: '2026-09-24T00:00:00.000Z',
  id: '20000000-0000-0000-0000-000000000001',
  is_active: false,
  slug: 'moon-observation',
  title: 'Moon Observation',
  topic_id: topic.id,
  updated_at: '2026-09-24T00:00:00.000Z'
}

function mockSupabase({
  data,
  error = null,
  session = { status: 'administrator', userId: 'administrator-id' }
}: {
  data: Topic | ContentItem | null
  error?: { code?: string; message: string } | null
  session?: { status: string; userId?: string }
}) {
  const query = {
    eq: vi.fn(),
    delete: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    update: vi.fn()
  }

  query.insert.mockReturnValue(query)
  query.delete.mockReturnValue(query)
  query.update.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.select.mockReturnValue(query)
  query.single.mockResolvedValue({ data, error })

  const from = vi.fn(() => query)
  vi.stubGlobal('useSupabase', () => ({ from }))
  vi.stubGlobal('useAdministratorSession', () => ({
    getAdministratorSession: vi.fn().mockResolvedValue(session)
  }))

  return { from, query }
}

describe('useAdminContentRepository', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects blank topic fields before making a database request', async () => {
    const { from } = mockSupabase({ data: topic })

    await expect(
      useAdminContentRepository().createTopic({
        is_active: false,
        name: '   ',
        slug: ''
      })
    ).resolves.toMatchObject({
      data: null,
      fieldErrors: {
        name: 'Enter a topic name.',
        slug: 'Enter a topic URL slug.'
      }
    })

    expect(from).not.toHaveBeenCalled()
  })

  it('creates an authorized topic with normalized values', async () => {
    const { query } = mockSupabase({ data: topic })

    await expect(
      useAdminContentRepository().createTopic({
        is_active: false,
        name: ' Moon Phases ',
        slug: ' MOON-PHASES '
      })
    ).resolves.toEqual({ data: topic, error: null, fieldErrors: {} })

    expect(query.insert).toHaveBeenCalledWith({
      is_active: false,
      name: 'Moon Phases',
      slug: 'moon-phases'
    })
  })

  it('returns an actionable duplicate topic error', async () => {
    mockSupabase({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      }
    })

    await expect(
      useAdminContentRepository().createTopic({
        is_active: false,
        name: 'Moon Phases',
        slug: 'moon-phases'
      })
    ).resolves.toMatchObject({
      data: null,
      fieldErrors: {
        slug: 'Choose a URL slug that is not already in use.'
      }
    })
  })

  it('updates an authorized content item active state', async () => {
    const { query } = mockSupabase({
      data: { ...content, is_active: true }
    })

    await expect(
      useAdminContentRepository().setContentActive(content.id, true)
    ).resolves.toEqual({
      data: { ...content, is_active: true },
      error: null,
      fieldErrors: {}
    })

    expect(query.update).toHaveBeenCalledWith({ is_active: true })
    expect(query.eq).toHaveBeenCalledWith('id', content.id)
  })

  it('does not submit a mutation without an authorized administrator session', async () => {
    const { from } = mockSupabase({
      data: topic,
      session: { status: 'signed-out' }
    })

    await expect(
      useAdminContentRepository().createContentItem({
        body: content.body,
        is_active: false,
        slug: content.slug,
        title: content.title,
        topic_id: content.topic_id
      })
    ).resolves.toEqual({
      data: null,
      error: 'Sign in as an administrator to manage content.',
      fieldErrors: {}
    })

    expect(from).not.toHaveBeenCalled()
  })

  it('does not submit a mutation when administrator session verification fails', async () => {
    const { from } = mockSupabase({
      data: topic,
      session: {
        status: 'error'
      }
    })
    vi.stubGlobal('useAdministratorSession', () => ({
      getAdministratorSession: vi.fn().mockResolvedValue({
        message: 'Your session could not be verified. Please sign in again.',
        status: 'error'
      })
    }))

    await expect(
      useAdminContentRepository().setTopicActive(topic.id, true)
    ).resolves.toEqual({
      data: null,
      error: 'Your session could not be verified. Please sign in again.',
      fieldErrors: {}
    })

    expect(from).not.toHaveBeenCalled()
  })

  it('deletes a content item only after administrator authorization', async () => {
    const { query } = mockSupabase({ data: null })

    await expect(
      useAdminContentRepository().deleteContentItem(content.id)
    ).resolves.toEqual({ error: null })

    expect(query.delete).toHaveBeenCalledOnce()
    expect(query.eq).toHaveBeenCalledWith('id', content.id)
  })
})
