<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import ContentSummary from '~/components/content/ContentSummary.vue'
import type { PublicTopicContent } from '~/composables/usePublicContent'

const route = useRoute()
const { getTopicContent } = usePublicContent()
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)
const topicContent = ref<PublicTopicContent | null>(null)

async function loadTopic() {
  errorMessage.value = null
  isLoading.value = true

  const result = await getTopicContent(String(route.params.slug))

  if (result.error) {
    errorMessage.value = result.error.message
  } else {
    topicContent.value = result.data
  }

  isLoading.value = false
}

onMounted(loadTopic)
</script>

<template>
  <section aria-labelledby="topic-heading">
    <p class="eyebrow">Astrology topic</p>
    <h1 id="topic-heading" class="page-heading">
      {{ topicContent?.topic.name ?? 'Topic' }}
    </h1>

    <ContentState
      v-if="isLoading"
      description="Fetching published content for this topic."
      title="Loading topic"
    />
    <ContentError
      v-else-if="errorMessage"
      :message="errorMessage"
      @retry="loadTopic"
    />
    <ContentState
      v-else-if="topicContent?.contentItems.length === 0"
      description="Check back soon for new guidance."
      title="No published content yet"
    />
    <div v-else class="content-summary-list">
      <ContentSummary
        v-for="content in topicContent?.contentItems"
        :key="content.id"
        :content="content"
        :topic-slug="topicContent?.topic.slug ?? ''"
      />
    </div>
  </section>
</template>
