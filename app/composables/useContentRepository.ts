import type { ContentItem, Topic } from '~/types/content'

export interface RepositoryFailure {
  message: string
}

export type RepositoryResult<T> =
  { data: T; error: null } | { data: null; error: RepositoryFailure }

function failure(message: string): RepositoryResult<never> {
  return {
    data: null,
    error: { message }
  }
}

export function useContentRepository() {
  async function getActiveTopics(): Promise<RepositoryResult<Topic[]>> {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('topics')
      .select('id, name, slug, is_active, created_at, updated_at')
      .order('name')

    if (error) {
      return failure('Topics could not be loaded. Please try again.')
    }

    return { data, error: null }
  }

  async function getActiveTopicBySlug(
    slug: string
  ): Promise<RepositoryResult<Topic>> {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('topics')
      .select('id, name, slug, is_active, created_at, updated_at')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return failure('The topic could not be loaded. Please try again.')
    }

    if (!data) {
      return failure('This topic is unavailable.')
    }

    return { data, error: null }
  }

  async function getActiveContentByTopic(
    topicId: string
  ): Promise<RepositoryResult<ContentItem[]>> {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('content_items')
      .select(
        'id, topic_id, title, slug, body, is_active, created_at, updated_at'
      )
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })

    if (error) {
      return failure('Content could not be loaded. Please try again.')
    }

    return { data, error: null }
  }

  async function getActiveContentBySlug(
    slug: string
  ): Promise<RepositoryResult<ContentItem>> {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('content_items')
      .select(
        'id, topic_id, title, slug, body, is_active, created_at, updated_at'
      )
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return failure('The content item could not be loaded. Please try again.')
    }

    if (!data) {
      return failure('This content item is unavailable.')
    }

    return { data, error: null }
  }

  return {
    getActiveContentBySlug,
    getActiveContentByTopic,
    getActiveTopicBySlug,
    getActiveTopics
  }
}
