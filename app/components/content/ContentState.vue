<script setup lang="ts">
defineProps<{
  description: string
  title: string
}>()
</script>

<template>
  <section class="content-state" aria-live="polite">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </section>
</template>
