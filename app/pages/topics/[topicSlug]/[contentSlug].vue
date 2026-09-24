<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ContentDetail from '~/components/content/ContentDetail.vue'
import ContentError from '~/components/content/ContentError.vue'
import ContentState from '~/components/content/ContentState.vue'
import type { ContentItem } from '~/types/content'

const route = useRoute()
const { getContent } = usePublicContent()
const { getAdministratorSession } = useAdministratorSession()
const content = ref<ContentItem | null>(null)
const errorMessage = ref<string | null>(null)
const isLoading = ref(true)
const isAdministrator = ref(false)

async function loadContent() {
  content.value = null
  errorMessage.value = null
  isLoading.value = true

  const result = await getContent(
    String(route.params.topicSlug),
    String(route.params.contentSlug)
  )

  if (result.error) {
    errorMessage.value = result.error.message
  } else {
    content.value = result.data
  }

  isLoading.value = false
}

onMounted(loadContent)
onMounted(async () => {
  const session = await getAdministratorSession()
  isAdministrator.value = session.status === 'administrator'
})
</script>

<template>
  <section aria-label="Astrology content">
    <ContentState
      v-if="isLoading"
      description="Fetching this published article."
      title="Loading content"
    />
    <ContentError
      v-else-if="errorMessage"
      :message="errorMessage"
      @retry="loadContent"
    />
    <template v-else-if="content">
      <div v-if="isAdministrator" class="public-admin-actions">
        <UButton :to="`/admin/content/${content.id}`" size="sm" variant="soft">
          Edit this article
        </UButton>
      </div>
      <ContentDetail :content="content" />
    </template>
  </section>
</template>
