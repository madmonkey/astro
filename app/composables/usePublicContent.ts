import type { ContentItem, Topic } from '~/types/content'
import type { RepositoryResult } from './useContentRepository'

export interface PublicTopicContent {
  contentItems: ContentItem[]
  topic: Topic
}

function unavailable<T>(message: string): RepositoryResult<T> {
  return {
    data: null,
    error: { message }
  }
}

export function usePublicContent() {
  const repository = useContentRepository()

  async function getTopics(): Promise<RepositoryResult<Topic[]>> {
    return repository.getActiveTopics()
  }

  async function getTopicContent(
    topicSlug: string
  ): Promise<RepositoryResult<PublicTopicContent>> {
    const topicResult = await repository.getActiveTopicBySlug(topicSlug)

    if (topicResult.error) {
      return topicResult
    }

    const contentResult = await repository.getActiveContentByTopic(
      topicResult.data.id
    )

    if (contentResult.error) {
      return contentResult
    }

    return {
      data: {
        contentItems: contentResult.data,
        topic: topicResult.data
      },
      error: null
    }
  }

  async function getContent(
    topicSlug: string,
    contentSlug: string
  ): Promise<RepositoryResult<ContentItem>> {
    const topicResult = await repository.getActiveTopicBySlug(topicSlug)

    if (topicResult.error) {
      return unavailable('This content item is unavailable.')
    }

    const contentResult = await repository.getActiveContentBySlug(contentSlug)

    if (
      contentResult.error ||
      contentResult.data.topic_id !== topicResult.data.id
    ) {
      return unavailable('This content item is unavailable.')
    }

    return contentResult
  }

  return {
    getContent,
    getTopicContent,
    getTopics
  }
}
