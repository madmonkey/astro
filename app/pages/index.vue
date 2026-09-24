<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import TopicList from '~/components/content/TopicList.vue'
import type { Topic } from '~/types/content'

const { getTopics } = usePublicContent()
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)
const topics = ref<Topic[]>([])

async function loadTopics() {
  errorMessage.value = null
  isLoading.value = true

  const result = await getTopics()

  if (result.error) {
    errorMessage.value = result.error.message
  } else {
    topics.value = result.data
  }

  isLoading.value = false
}

onMounted(loadTopics)
</script>

<template>
  <section aria-labelledby="topics-heading">
    <p class="eyebrow">Explore astrology</p>
    <h1 id="topics-heading" class="page-heading">Current topics</h1>

    <ContentState
      v-if="isLoading"
      description="Fetching the latest astrology content."
      title="Loading topics"
    />
    <ContentError
      v-else-if="errorMessage"
      :message="errorMessage"
      @retry="loadTopics"
    />
    <ContentState
      v-else-if="topics.length === 0"
      description="Check back soon for new guidance."
      title="No published topics yet"
    />
    <TopicList v-else :topics="topics" />
  </section>
</template>
