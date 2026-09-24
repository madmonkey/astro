<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminTopicForm from '~/components/admin/TopicForm.vue'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import type { Topic, TopicFormInput } from '~/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { createTopic, deleteTopic, getTopics, setTopicActive } =
  useAdminContentRepository()
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)
const saveMessage = ref<string | null>(null)
const saveFieldErrors = ref<Partial<Record<keyof TopicFormInput, string>>>({})
const topics = ref<Topic[]>([])

async function loadTopics() {
  errorMessage.value = null
  isLoading.value = true
  const result = await getTopics()
  isLoading.value = false

  if (!result.data) {
    errorMessage.value = result.error ?? 'Topics could not be loaded.'
    return
  }

  topics.value = result.data
}

async function saveTopic(input: TopicFormInput) {
  errorMessage.value = null
  saveFieldErrors.value = {}
  saveMessage.value = null
  const result = await createTopic(input)

  if (!result.data) {
    errorMessage.value = result.error ?? 'This topic could not be saved.'
    saveFieldErrors.value = result.fieldErrors
    return
  }

  saveMessage.value = `Created ${result.data.name}.`
  await loadTopics()
}

async function changeActiveState(topic: Topic) {
  const action = topic.is_active ? 'deactivate' : 'activate'

  if (!window.confirm(`Are you sure you want to ${action} "${topic.name}"?`)) {
    return
  }

  const result = await setTopicActive(topic.id, !topic.is_active)

  if (!result.data) {
    errorMessage.value = result.error ?? 'This topic could not be updated.'
    return
  }

  topics.value = topics.value.map((item) =>
    item.id === result.data.id ? result.data : item
  )
}

async function removeTopic(topic: Topic) {
  const message =
    `Delete "${topic.name}" permanently? ` +
    'All content assigned to this topic will also be deleted.'

  if (!window.confirm(message)) {
    return
  }

  const result = await deleteTopic(topic.id)

  if (result.error) {
    errorMessage.value = result.error
    return
  }

  topics.value = topics.value.filter((item) => item.id !== topic.id)
  saveMessage.value = `Deleted ${topic.name} and its assigned content.`
}

onMounted(loadTopics)
</script>

<template>
  <section aria-labelledby="topics-heading">
    <p class="eyebrow">Administrator</p>
    <h1 id="topics-heading" class="page-heading">Topics</h1>
    <p class="admin-navigation">
      <NuxtLink to="/admin">Administration home</NuxtLink>
      <NuxtLink to="/admin/content">Manage content</NuxtLink>
    </p>

    <p v-if="saveMessage" class="form-success" role="status">
      {{ saveMessage }}
    </p>
    <ContentError
      v-if="errorMessage"
      :message="errorMessage"
      @retry="loadTopics"
    />

    <section class="admin-panel" aria-labelledby="new-topic-heading">
      <h2 id="new-topic-heading">Create topic</h2>
      <AdminTopicForm :errors="saveFieldErrors" @save="saveTopic" />
    </section>

    <ContentState
      v-if="isLoading"
      description="Loading all topics, including inactive drafts."
      title="Loading topics"
    />
    <ul v-else class="admin-record-list">
      <li v-for="topic in topics" :key="topic.id">
        <div>
          <NuxtLink :to="`/admin/topics/${topic.id}`">{{
            topic.name
          }}</NuxtLink>
          <p>{{ topic.slug }}</p>
        </div>
        <div class="admin-record-actions">
          <span :class="{ 'status-inactive': !topic.is_active }">
            {{ topic.is_active ? 'Active' : 'Inactive' }}
          </span>
          <button type="button" @click="changeActiveState(topic)">
            {{ topic.is_active ? 'Deactivate' : 'Activate' }}
          </button>
          <UButton
            color="error"
            size="sm"
            type="button"
            variant="soft"
            @click="removeTopic(topic)"
          >
            Delete
          </UButton>
        </div>
      </li>
    </ul>
  </section>
</template>
