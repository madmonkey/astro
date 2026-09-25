<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const maximumFailedAttempts = 3
const lockoutDurationMilliseconds = 15 * 60 * 1000
const throttleStorageKey = 'astro.admin-sign-in-throttle'

type SignInThrottle = {
  failedAttempts: number
  lockedUntil: number | null
}

const emit = defineEmits<{
  authenticated: []
}>()

const { signIn } = useAdministratorSession()
const email = ref('')
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)
const password = ref('')
const remainingSeconds = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | undefined

const isLocked = computed(() => remainingSeconds.value > 0)
const lockoutMessage = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  const formattedDuration =
    minutes > 0
      ? `${minutes} minute${minutes === 1 ? '' : 's'}${seconds ? ` and ${seconds} second${seconds === 1 ? '' : 's'}` : ''}`
      : `${seconds} second${seconds === 1 ? '' : 's'}`

  return `Too many failed sign-in attempts. Try again in ${formattedDuration}.`
})

function getThrottle(): SignInThrottle {
  const storedThrottle = window.localStorage.getItem(throttleStorageKey)

  if (!storedThrottle) {
    return { failedAttempts: 0, lockedUntil: null }
  }

  try {
    const throttle = JSON.parse(storedThrottle) as Partial<SignInThrottle>

    if (
      typeof throttle.failedAttempts !== 'number' ||
      !Number.isInteger(throttle.failedAttempts) ||
      throttle.failedAttempts < 0 ||
      (throttle.lockedUntil !== null &&
        typeof throttle.lockedUntil !== 'number')
    ) {
      throw new Error('Invalid sign-in throttle state.')
    }

    return {
      failedAttempts: throttle.failedAttempts,
      lockedUntil: throttle.lockedUntil ?? null
    }
  } catch {
    window.localStorage.removeItem(throttleStorageKey)
    return { failedAttempts: 0, lockedUntil: null }
  }
}

function saveThrottle(throttle: SignInThrottle) {
  window.localStorage.setItem(throttleStorageKey, JSON.stringify(throttle))
}

function refreshLockout() {
  const { lockedUntil } = getThrottle()

  if (!lockedUntil || lockedUntil <= Date.now()) {
    if (lockedUntil) {
      window.localStorage.removeItem(throttleStorageKey)
    }

    remainingSeconds.value = 0
    return
  }

  remainingSeconds.value = Math.ceil((lockedUntil - Date.now()) / 1000)
}

function recordFailedAttempt() {
  const throttle = getThrottle()
  const failedAttempts = throttle.failedAttempts + 1

  if (failedAttempts >= maximumFailedAttempts) {
    saveThrottle({
      failedAttempts: 0,
      lockedUntil: Date.now() + lockoutDurationMilliseconds
    })
  } else {
    saveThrottle({ failedAttempts, lockedUntil: null })
  }

  refreshLockout()
}

function clearThrottle() {
  window.localStorage.removeItem(throttleStorageKey)
  remainingSeconds.value = 0
}

async function submit() {
  errorMessage.value = null

  if (isLocked.value) {
    return
  }

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Enter your email address and password.'
    return
  }

  isSubmitting.value = true
  const session = await signIn(email.value.trim(), password.value)
  isSubmitting.value = false

  if (session.status === 'administrator') {
    clearThrottle()
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

  if (session.failedCredentials) {
    recordFailedAttempt()
  }

  errorMessage.value = session.message
}

onMounted(() => {
  refreshLockout()
  countdownTimer = setInterval(refreshLockout, 1000)
  window.addEventListener('storage', refreshLockout)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  window.removeEventListener('storage', refreshLockout)
})
</script>

<template>
  <form class="admin-sign-in-form" @submit.prevent="submit">
    <div v-if="isLocked" class="form-error" role="alert">
      {{ lockoutMessage }}
    </div>
    <div v-else-if="errorMessage" class="form-error" role="alert">
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

    <button :disabled="isSubmitting || isLocked" type="submit">
      {{
        isSubmitting
          ? 'Signing in...'
          : isLocked
            ? 'Sign in temporarily unavailable'
            : 'Sign in'
      }}
    </button>
  </form>
</template>
