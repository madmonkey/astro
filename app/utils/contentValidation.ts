import type { ContentItemFormInput, TopicFormInput } from '~/types/content'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export interface ValidationResult<T> {
  errors: Partial<Record<keyof T, string>>
  value: T
}

export function normalizeSlug(value: string): string {
  return value.trim().toLowerCase()
}

export function normalizeTopicInput(input: TopicFormInput): TopicFormInput {
  return {
    ...input,
    name: input.name.trim(),
    slug: normalizeSlug(input.slug)
  }
}

export function normalizeContentItemInput(
  input: ContentItemFormInput
): ContentItemFormInput {
  return {
    ...input,
    slug: normalizeSlug(input.slug),
    title: input.title.trim(),
    topic_id: input.topic_id.trim()
  }
}

export function validateTopicInput(
  input: TopicFormInput
): ValidationResult<TopicFormInput> {
  const value = normalizeTopicInput(input)
  const errors: ValidationResult<TopicFormInput>['errors'] = {}

  if (!value.name) {
    errors.name = 'Enter a topic name.'
  }

  if (!value.slug) {
    errors.slug = 'Enter a topic URL slug.'
  } else if (!slugPattern.test(value.slug)) {
    errors.slug =
      'Use lowercase letters, numbers, and single hyphens in the URL slug.'
  }

  return { errors, value }
}

export function validateContentItemInput(
  input: ContentItemFormInput
): ValidationResult<ContentItemFormInput> {
  const value = normalizeContentItemInput(input)
  const errors: ValidationResult<ContentItemFormInput>['errors'] = {}

  if (!value.title) {
    errors.title = 'Enter a content title.'
  }

  if (!value.slug) {
    errors.slug = 'Enter a content URL slug.'
  } else if (!slugPattern.test(value.slug)) {
    errors.slug =
      'Use lowercase letters, numbers, and single hyphens in the URL slug.'
  }

  if (!value.body.trim()) {
    errors.body = 'Enter Markdown content.'
  }

  if (!value.topic_id) {
    errors.topic_id = 'Select a topic.'
  }

  return { errors, value }
}
