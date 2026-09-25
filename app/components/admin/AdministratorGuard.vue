<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ContentState from '~/components/content/ContentState.vue'

const { getAdministratorSession } = useAdministratorSession()
const emit = defineEmits<{
  authorized: []
}>()
const isAuthorized = ref(false)
const isChecking = ref(true)

onMounted(async () => {
  const session = await getAdministratorSession()

  if (session.status === 'administrator') {
    isAuthorized.value = true
    isChecking.value = false
    emit('authorized')
    return
  }

  await navigateTo({
    path: '/admin',
    query: {
      reason:
        session.status === 'not-administrator'
          ? 'access-denied'
          : 'sign-in-required'
    }
  })
})
</script>

<template>
  <div>
    <ContentState
      v-if="isChecking"
      description="Checking your administrator access."
      title="Loading administration"
    />
    <slot v-else-if="isAuthorized" />
  </div>
</template>
