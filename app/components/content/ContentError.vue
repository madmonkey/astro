<script setup lang="ts">
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <section class="content-state content-error" role="alert">
    <h1>Unable to load content</h1>
    <p>{{ message }}</p>
    <button type="button" @click="emit('retry')">Try again</button>
  </section>
</template>
