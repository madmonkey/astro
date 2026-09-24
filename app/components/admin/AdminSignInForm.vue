<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  authenticated: []
}>()

const { signIn } = useAdministratorSession()
const email = ref('')
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)
const password = ref('')

async function submit() {
  errorMessage.value = null

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Enter your email address and password.'
    return
  }

  isSubmitting.value = true
  const session = await signIn(email.value.trim(), password.value)
  isSubmitting.value = false

  if (session.status === 'administrator') {
    emit('authenticated')
    return
  }

  if (session.status === 'not-administrator') {
    errorMessage.value = 'This account is not authorized to manage content.'
    return
  }

  if (session.status === 'signed-out') {
    errorMessage.value = 'Your session has ended. Please sign in again.'
    return
  }

  errorMessage.value = session.message
}
</script>

<template>
  <form class="admin-sign-in-form" @submit.prevent="submit">
    <div v-if="errorMessage" class="form-error" role="alert">
      {{ errorMessage }}
    </div>

    <div class="form-field">
      <label for="email">Email address</label>
      <input
        id="email"
        v-model="email"
        autocomplete="email"
        inputmode="email"
        name="email"
        required
        type="email"
      />
    </div>

    <div class="form-field">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        autocomplete="current-password"
        name="password"
        required
        type="password"
      />
    </div>

    <button :disabled="isSubmitting" type="submit">
      {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
    </button>
  </form>
</template>
