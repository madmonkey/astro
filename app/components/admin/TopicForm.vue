<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { TopicFormInput } from '~/types/content'
import { validateTopicInput } from '~/utils/contentValidation'

const props = defineProps<{
  errors?: Partial<Record<keyof TopicFormInput, string>>
  initialValue?: TopicFormInput
}>()

const emit = defineEmits<{
  submit: [value: TopicFormInput]
}>()

const values = reactive<TopicFormInput>({
  is_active: false,
  name: '',
  slug: '',
  ...props.initialValue
})
const fieldErrors = ref<Partial<Record<keyof TopicFormInput, string>>>({})
const visibleErrors = computed(() => ({
  ...props.errors,
  ...fieldErrors.value
}))

function submit() {
  const validation = validateTopicInput(values)
  fieldErrors.value = validation.errors

  if (Object.keys(validation.errors).length === 0) {
    emit('submit', validation.value)
  }
}
</script>

<template>
  <form class="admin-content-form" novalidate @submit.prevent="submit">
    <div class="form-field">
      <label for="topic-name">Topic name</label>
      <input
        id="topic-name"
        v-model="values.name"
        :aria-describedby="visibleErrors.name ? 'topic-name-error' : undefined"
        :aria-invalid="Boolean(visibleErrors.name)"
        name="name"
        required
        type="text"
      />
      <p v-if="visibleErrors.name" id="topic-name-error" class="field-error">
        {{ visibleErrors.name }}
      </p>
    </div>

    <div class="form-field">
      <label for="topic-slug">URL slug</label>
      <input
        id="topic-slug"
        v-model="values.slug"
        :aria-describedby="visibleErrors.slug ? 'topic-slug-error' : undefined"
        :aria-invalid="Boolean(visibleErrors.slug)"
        name="slug"
        required
        type="text"
      />
      <p v-if="visibleErrors.slug" id="topic-slug-error" class="field-error">
        {{ visibleErrors.slug }}
      </p>
    </div>

    <label class="checkbox-field">
      <input v-model="values.is_active" type="checkbox" />
      Make this topic visible to visitors
    </label>

    <button type="submit">Save topic</button>
  </form>
</template>
