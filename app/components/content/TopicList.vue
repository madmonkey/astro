<script setup lang="ts">
import type { Topic } from '~/types/content'

defineProps<{
  topics: Topic[]
}>()
</script>

<template>
  <ul class="topic-list">
    <li v-for="topic in topics" :key="topic.id">
      <NuxtLink :to="`/topics/${topic.slug}`">{{ topic.name }}</NuxtLink>
    </li>
  </ul>
</template>
