<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem } from '~/types/content'

const props = defineProps<{
  content: ContentItem
  topicSlug: string
}>()

const summary = computed(() =>
  props.content.body
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[`#>*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
)
</script>

<template>
  <article class="content-summary">
    <h2>
      <NuxtLink :to="`/topics/${topicSlug}/${content.slug}`">
        {{ content.title }}
      </NuxtLink>
    </h2>
    <p>{{ summary }}</p>
    <NuxtLink
      class="content-summary-link"
      :to="`/topics/${topicSlug}/${content.slug}`"
    >
      Read article
    </NuxtLink>
  </article>
</template>
