<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminContentForm from '~/components/admin/ContentForm.vue'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import type { ContentItem, ContentItemFormInput, Topic } from '~/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { createContentItem, getContentItems, getTopics, setContentActive } =
  useAdminContentRepository()
const contentItems = ref<ContentItem[]>([])
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)
const saveMessage = ref<string | null>(null)
const saveFieldErrors = ref<
  Partial<Record<keyof ContentItemFormInput, string>>
>({})
const topics = ref<Topic[]>([])

async function loadContent() {
  errorMessage.value = null
  isLoading.value = true
  const [contentResult, topicResult] = await Promise.all([
    getContentItems(),
    getTopics()
  ])
  isLoading.value = false

  if (!contentResult.data || !topicResult.data) {
    errorMessage.value =
      contentResult.error ?? topicResult.error ?? 'Content could not be loaded.'
    return
  }

  contentItems.value = contentResult.data
  topics.value = topicResult.data
}

async function saveContent(input: ContentItemFormInput) {
  errorMessage.value = null
  saveFieldErrors.value = {}
  saveMessage.value = null
  const result = await createContentItem(input)

  if (!result.data) {
    errorMessage.value = result.error ?? 'This content item could not be saved.'
    saveFieldErrors.value = result.fieldErrors
    return
  }

  saveMessage.value = `Created ${result.data.title}.`
  await loadContent()
}

async function changeActiveState(content: ContentItem) {
  const action = content.is_active ? 'deactivate' : 'activate'

  if (
    !window.confirm(`Are you sure you want to ${action} "${content.title}"?`)
  ) {
    return
  }

  const result = await setContentActive(content.id, !content.is_active)

  if (!result.data) {
    errorMessage.value =
      result.error ?? 'This content item could not be updated.'
    return
  }

  contentItems.value = contentItems.value.map((item) =>
    item.id === result.data.id ? result.data : item
  )
}

function topicName(topicId: string) {
  return (
    topics.value.find((topic) => topic.id === topicId)?.name ?? 'Unknown topic'
  )
}

onMounted(loadContent)
</script>

<template>
  <section aria-labelledby="content-heading">
    <p class="eyebrow">Administrator</p>
    <h1 id="content-heading" class="page-heading">Content</h1>
    <p class="admin-navigation">
      <NuxtLink to="/admin">Administration home</NuxtLink>
      <NuxtLink to="/admin/topics">Manage topics</NuxtLink>
    </p>

    <p v-if="saveMessage" class="form-success" role="status">
      {{ saveMessage }}
    </p>
    <ContentError
      v-if="errorMessage"
      :message="errorMessage"
      @retry="loadContent"
    />

    <section class="admin-panel" aria-labelledby="new-content-heading">
      <h2 id="new-content-heading">Create content</h2>
      <AdminContentForm
        :errors="saveFieldErrors"
        :topics="topics"
        @save="saveContent"
      />
    </section>

    <ContentState
      v-if="isLoading"
      description="Loading all content, including inactive drafts."
      title="Loading content"
    />
    <ul v-else class="admin-record-list">
      <li v-for="content in contentItems" :key="content.id">
        <div>
          <NuxtLink :to="`/admin/content/${content.id}`">
            {{ content.title }}
          </NuxtLink>
          <p>{{ topicName(content.topic_id) }} · {{ content.slug }}</p>
        </div>
        <div class="admin-record-actions">
          <span :class="{ 'status-inactive': !content.is_active }">
            {{ content.is_active ? 'Active' : 'Inactive' }}
          </span>
          <button type="button" @click="changeActiveState(content)">
            {{ content.is_active ? 'Deactivate' : 'Activate' }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
