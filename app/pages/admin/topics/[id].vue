<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminTopicForm from '~/components/admin/TopicForm.vue'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import type { Topic, TopicFormInput } from '~/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const { getTopic, updateTopic } = useAdminContentRepository()
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)
const saveMessage = ref<string | null>(null)
const saveFieldErrors = ref<Partial<Record<keyof TopicFormInput, string>>>({})
const topic = ref<Topic | null>(null)

const initialValue = computed<TopicFormInput | undefined>(() => {
  if (!topic.value) {
    return undefined
  }

  return {
    is_active: topic.value.is_active,
    name: topic.value.name,
    slug: topic.value.slug
  }
})

async function loadTopic() {
  errorMessage.value = null
  isLoading.value = true
  const result = await getTopic(String(route.params.id))
  isLoading.value = false

  if (!result.data) {
    errorMessage.value = result.error ?? 'This topic could not be loaded.'
    return
  }

  topic.value = result.data
}

async function saveTopic(input: TopicFormInput) {
  if (!topic.value) {
    return
  }

  saveMessage.value = null
  errorMessage.value = null
  saveFieldErrors.value = {}
  const result = await updateTopic(topic.value.id, input)

  if (!result.data) {
    errorMessage.value = result.error ?? 'This topic could not be saved.'
    saveFieldErrors.value = result.fieldErrors
    return
  }

  topic.value = result.data
  saveMessage.value = `Saved ${result.data.name}.`
}

onMounted(loadTopic)
</script>

<template>
  <section aria-labelledby="topic-edit-heading">
    <p class="eyebrow">Administrator</p>
    <h1 id="topic-edit-heading" class="page-heading">Edit topic</h1>
    <p class="admin-navigation">
      <NuxtLink to="/admin/topics">Back to topics</NuxtLink>
    </p>

    <ContentState
      v-if="isLoading"
      description="Loading this topic."
      title="Loading topic"
    />
    <ContentError
      v-else-if="errorMessage"
      :message="errorMessage"
      @retry="loadTopic"
    />
    <template v-else-if="topic && initialValue">
      <p v-if="saveMessage" class="form-success" role="status">
        {{ saveMessage }}
      </p>
      <AdminTopicForm
        :errors="saveFieldErrors"
        :initial-value="initialValue"
        @save="saveTopic"
      />
    </template>
  </section>
</template>
