<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminSignInForm from '~/components/admin/AdminSignInForm.vue'
import ContentState from '~/components/content/ContentState.vue'
import type { AdministratorSession } from '~/composables/useAdministratorSession'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { getAdministratorSession, signOut } = useAdministratorSession()
const isLoading = ref(true)
const session = ref<AdministratorSession | null>(null)

const accessMessage = computed(() => {
  if (route.query.reason === 'access-denied') {
    return 'This account is not authorized to manage content.'
  }

  if (route.query.reason === 'sign-in-required') {
    return 'Sign in to continue to content management.'
  }

  return null
})

async function loadSession() {
  isLoading.value = true
  session.value = await getAdministratorSession()
  isLoading.value = false
}

async function endSession() {
  await signOut()
  await loadSession()
}

onMounted(loadSession)
</script>

<template>
  <section aria-labelledby="admin-heading">
    <p class="eyebrow">Administrator</p>
    <h1 id="admin-heading" class="page-heading">Content management</h1>

    <ContentState
      v-if="isLoading"
      description="Checking your administrator access."
      title="Loading administration"
    />
    <template v-else-if="session?.status === 'administrator'">
      <p class="admin-introduction">
        Your administrator session is active. Topic and content editing will
        appear here.
      </p>
      <button class="admin-sign-out" type="button" @click="endSession">
        Sign out
      </button>
    </template>
    <template v-else>
      <p v-if="accessMessage" class="form-error" role="alert">
        {{ accessMessage }}
      </p>
      <AdminSignInForm @authenticated="loadSession" />
    </template>
  </section>
</template>
