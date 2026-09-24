<script setup lang="ts">
import { computed } from 'vue'
import type { ContentItem } from '~/types/content'
import { renderMarkdown } from '~/utils/renderMarkdown'

const props = defineProps<{
  content: ContentItem
}>()

const renderedBody = computed(() => renderMarkdown(props.content.body))
</script>

<template>
  <article class="content-detail">
    <h1>{{ content.title }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown removes raw HTML and sanitizes output. -->
    <div class="markdown-content" v-html="renderedBody" />
  </article>
</template>
