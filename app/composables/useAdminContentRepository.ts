import type {
  ContentItem,
  ContentItemFormInput,
  Topic,
  TopicFormInput
} from '~/types/content'
import {
  validateContentItemInput,
  validateTopicInput
} from '~/utils/contentValidation'

type FieldErrors<T> = Partial<Record<keyof T, string>>

export type AdminMutationResult<T, TInput> =
  | { data: T; error: null; fieldErrors: FieldErrors<TInput> }
  | { data: null; error: string; fieldErrors: FieldErrors<TInput> }

export type AdminQueryResult<T> =
  { data: T; error: null } | { data: null; error: string }

export interface AdminDeleteResult {
  error: string | null
}

interface DatabaseError {
  code?: string
  message: string
}

function failed<T, TInput>(
  error: string,
  fieldErrors: FieldErrors<TInput> = {}
): AdminMutationResult<T, TInput> {
  return { data: null, error, fieldErrors }
}

function mutationError<T, TInput>(
  error: DatabaseError
): AdminMutationResult<T, TInput> {
  if (error.code === '23505') {
    return failed('Correct the duplicate value and try again.', {
      slug: 'Choose a URL slug that is not already in use.'
    } as FieldErrors<TInput>)
  }

  if (error.code === '42501') {
    return failed(
      'Your administrator session is no longer authorized. Please sign in again.'
    )
  }

  return failed('Your changes could not be saved. Please try again.')
}

export function useAdminContentRepository() {
  async function authorize<T, TInput>(): Promise<AdminMutationResult<
    T,
    TInput
  > | null> {
    const session = await useAdministratorSession().getAdministratorSession()

    if (session.status === 'administrator') {
      return null
    }

    if (session.status === 'error') {
      return failed(session.message)
    }

    return failed('Sign in as an administrator to manage content.')
  }

  async function getTopics(): Promise<AdminQueryResult<Topic[]>> {
    const authorization = await authorize<Topic[], TopicFormInput>()

    if (authorization) {
      return {
        data: null,
        error:
          authorization.error ?? 'Administrator access could not be verified.'
      }
    }

    const { data, error } = await useSupabase()
      .from('topics')
      .select('id, name, slug, is_active, created_at, updated_at')
      .order('name')

    if (error) {
      return {
        data: null,
        error: 'Topics could not be loaded. Please try again.'
      }
    }

    return { data, error: null }
  }

  async function getTopic(id: string): Promise<AdminQueryResult<Topic>> {
    const authorization = await authorize<Topic, TopicFormInput>()

    if (authorization) {
      return {
        data: null,
        error:
          authorization.error ?? 'Administrator access could not be verified.'
      }
    }

    const { data, error } = await useSupabase()
      .from('topics')
      .select('id, name, slug, is_active, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return { data: null, error: 'This topic could not be loaded.' }
    }

    return { data, error: null }
  }

  async function getContentItems(): Promise<AdminQueryResult<ContentItem[]>> {
    const authorization = await authorize<ContentItem[], ContentItemFormInput>()

    if (authorization) {
      return {
        data: null,
        error:
          authorization.error ?? 'Administrator access could not be verified.'
      }
    }

    const { data, error } = await useSupabase()
      .from('content_items')
      .select(
        'id, topic_id, title, slug, body, is_active, created_at, updated_at'
      )
      .order('updated_at', { ascending: false })

    if (error) {
      return {
        data: null,
        error: 'Content items could not be loaded. Please try again.'
      }
    }

    return { data, error: null }
  }

  async function getContentItem(
    id: string
  ): Promise<AdminQueryResult<ContentItem>> {
    const authorization = await authorize<ContentItem, ContentItemFormInput>()

    if (authorization) {
      return {
        data: null,
        error:
          authorization.error ?? 'Administrator access could not be verified.'
      }
    }

    const { data, error } = await useSupabase()
      .from('content_items')
      .select(
        'id, topic_id, title, slug, body, is_active, created_at, updated_at'
      )
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return { data: null, error: 'This content item could not be loaded.' }
    }

    return { data, error: null }
  }

  async function deleteTopic(id: string): Promise<AdminDeleteResult> {
    const authorization = await authorize<Topic, TopicFormInput>()

    if (authorization) {
      return {
        error:
          authorization.error ?? 'Administrator access could not be verified.'
      }
    }

    const { error } = await useSupabase().from('topics').delete().eq('id', id)

    if (error) {
      return {
        error:
          error.code === '42501'
            ? 'Your administrator session is no longer authorized. Please sign in again.'
            : 'This topic could not be deleted. Please try again.'
      }
    }

    return { error: null }
  }

  async function deleteContentItem(id: string): Promise<AdminDeleteResult> {
    const authorization = await authorize<ContentItem, ContentItemFormInput>()

    if (authorization) {
      return {
        error:
          authorization.error ?? 'Administrator access could not be verified.'
      }
    }

    const { error } = await useSupabase()
      .from('content_items')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        error:
          error.code === '42501'
            ? 'Your administrator session is no longer authorized. Please sign in again.'
            : 'This content item could not be deleted. Please try again.'
      }
    }

    return { error: null }
  }

  async function createTopic(
    input: TopicFormInput
  ): Promise<AdminMutationResult<Topic, TopicFormInput>> {
    const validation = validateTopicInput(input)

    if (Object.keys(validation.errors).length > 0) {
      return failed('Correct the highlighted fields.', validation.errors)
    }

    const authorization = await authorize<Topic, TopicFormInput>()

    if (authorization) {
      return authorization
    }

    const { data, error } = await useSupabase()
      .from('topics')
      .insert(validation.value)
      .select('id, name, slug, is_active, created_at, updated_at')
      .single()

    if (error) {
      return mutationError(error)
    }

    return { data, error: null, fieldErrors: {} }
  }

  async function updateTopic(
    id: string,
    input: TopicFormInput
  ): Promise<AdminMutationResult<Topic, TopicFormInput>> {
    const validation = validateTopicInput(input)

    if (Object.keys(validation.errors).length > 0) {
      return failed('Correct the highlighted fields.', validation.errors)
    }

    const authorization = await authorize<Topic, TopicFormInput>()

    if (authorization) {
      return authorization
    }

    const { data, error } = await useSupabase()
      .from('topics')
      .update(validation.value)
      .eq('id', id)
      .select('id, name, slug, is_active, created_at, updated_at')
      .single()

    if (error) {
      return mutationError(error)
    }

    return { data, error: null, fieldErrors: {} }
  }

  async function createContentItem(
    input: ContentItemFormInput
  ): Promise<AdminMutationResult<ContentItem, ContentItemFormInput>> {
    const validation = validateContentItemInput(input)

    if (Object.keys(validation.errors).length > 0) {
      return failed('Correct the highlighted fields.', validation.errors)
    }

    const authorization = await authorize<ContentItem, ContentItemFormInput>()

    if (authorization) {
      return authorization
    }

    const { data, error } = await useSupabase()
      .from('content_items')
      .insert(validation.value)
      .select(
        'id, topic_id, title, slug, body, is_active, created_at, updated_at'
      )
      .single()

    if (error) {
      return mutationError(error)
    }

    return { data, error: null, fieldErrors: {} }
  }

  async function updateContentItem(
    id: string,
    input: ContentItemFormInput
  ): Promise<AdminMutationResult<ContentItem, ContentItemFormInput>> {
    const validation = validateContentItemInput(input)

    if (Object.keys(validation.errors).length > 0) {
      return failed('Correct the highlighted fields.', validation.errors)
    }

    const authorization = await authorize<ContentItem, ContentItemFormInput>()

    if (authorization) {
      return authorization
    }

    const { data, error } = await useSupabase()
      .from('content_items')
      .update(validation.value)
      .eq('id', id)
      .select(
        'id, topic_id, title, slug, body, is_active, created_at, updated_at'
      )
      .single()

    if (error) {
      return mutationError(error)
    }

    return { data, error: null, fieldErrors: {} }
  }

  async function setContentActive(
    id: string,
    isActive: boolean
  ): Promise<AdminMutationResult<ContentItem, ContentItemFormInput>> {
    const authorization = await authorize<ContentItem, ContentItemFormInput>()

    if (authorization) {
      return authorization
    }

    const { data, error } = await useSupabase()
      .from('content_items')
      .update({ is_active: isActive })
      .eq('id', id)
      .select(
        'id, topic_id, title, slug, body, is_active, created_at, updated_at'
      )
      .single()

    if (error) {
      return mutationError(error)
    }

    return { data, error: null, fieldErrors: {} }
  }

  async function setTopicActive(
    id: string,
    isActive: boolean
  ): Promise<AdminMutationResult<Topic, TopicFormInput>> {
    const authorization = await authorize<Topic, TopicFormInput>()

    if (authorization) {
      return authorization
    }

    const { data, error } = await useSupabase()
      .from('topics')
      .update({ is_active: isActive })
      .eq('id', id)
      .select('id, name, slug, is_active, created_at, updated_at')
      .single()

    if (error) {
      return mutationError(error)
    }

    return { data, error: null, fieldErrors: {} }
  }

  return {
    createContentItem,
    createTopic,
    deleteContentItem,
    deleteTopic,
    getContentItem,
    getContentItems,
    getTopic,
    getTopics,
    setContentActive,
    setTopicActive,
    updateContentItem,
    updateTopic
  }
}
