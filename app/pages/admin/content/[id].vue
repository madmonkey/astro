<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminContentForm from '~/components/admin/ContentForm.vue'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import type { ContentItem, ContentItemFormInput, Topic } from '~/types/content'
import { renderMarkdown } from '~/utils/renderMarkdown'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const { getContentItem, getTopics, updateContentItem } =
  useAdminContentRepository()
const content = ref<ContentItem | null>(null)
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)
const saveMessage = ref<string | null>(null)
const saveFieldErrors = ref<
  Partial<Record<keyof ContentItemFormInput, string>>
>({})
const topics = ref<Topic[]>([])

const initialValue = computed<ContentItemFormInput | undefined>(() => {
  if (!content.value) {
    return undefined
  }

  return {
    body: content.value.body,
    is_active: content.value.is_active,
    slug: content.value.slug,
    title: content.value.title,
    topic_id: content.value.topic_id
  }
})
const preview = computed(() =>
  content.value ? renderMarkdown(content.value.body) : ''
)

async function loadContent() {
  errorMessage.value = null
  isLoading.value = true
  const [contentResult, topicResult] = await Promise.all([
    getContentItem(String(route.params.id)),
    getTopics()
  ])
  isLoading.value = false

  if (!contentResult.data || !topicResult.data) {
    errorMessage.value =
      contentResult.error ?? topicResult.error ?? 'Content could not be loaded.'
    return
  }

  content.value = contentResult.data
  topics.value = topicResult.data
}

async function saveContent(input: ContentItemFormInput) {
  if (!content.value) {
    return
  }

  saveMessage.value = null
  errorMessage.value = null
  saveFieldErrors.value = {}
  const result = await updateContentItem(content.value.id, input)

  if (!result.data) {
    errorMessage.value = result.error ?? 'This content item could not be saved.'
    saveFieldErrors.value = result.fieldErrors
    return
  }

  content.value = result.data
  saveMessage.value = `Saved ${result.data.title}.`
}

onMounted(loadContent)
</script>

<template>
  <section aria-labelledby="content-edit-heading">
    <p class="eyebrow">Administrator</p>
    <h1 id="content-edit-heading" class="page-heading">Edit content</h1>
    <p class="admin-navigation">
      <NuxtLink to="/admin/content">Back to content</NuxtLink>
    </p>

    <ContentState
      v-if="isLoading"
      description="Loading this content item."
      title="Loading content"
    />
    <ContentError
      v-else-if="errorMessage"
      :message="errorMessage"
      @retry="loadContent"
    />
    <template v-else-if="content && initialValue">
      <p v-if="saveMessage" class="form-success" role="status">
        {{ saveMessage }}
      </p>
      <AdminContentForm
        :errors="saveFieldErrors"
        :initial-value="initialValue"
        :topics="topics"
        @submit="saveContent"
      />
      <section class="admin-panel" aria-labelledby="markdown-preview-heading">
        <h2 id="markdown-preview-heading">Markdown preview</h2>
        <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown removes raw HTML and sanitizes output. -->
        <div class="markdown-content" v-html="preview" />
      </section>
    </template>
  </section>
</template>
