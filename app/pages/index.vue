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
    <div class="landing-hero">
      <p class="eyebrow">A quieter way to explore astrology</p>
      <h1 id="topics-heading" class="landing-heading">
        Find a rhythm that feels like your own.
      </h1>
      <p class="landing-description">
        Thoughtful guides for noticing cycles, reflecting on your sky, and
        making room for what matters.
      </p>
      <a class="landing-action" href="#topics">Explore current topics</a>
    </div>

    <section id="topics" aria-labelledby="current-topics-heading">
      <p class="eyebrow">Explore the library</p>
      <h2 id="current-topics-heading" class="section-heading">
        Current topics
      </h2>
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
  </section>
</template>
