<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { ContentItemFormInput, Topic } from '~/types/content'
import { validateContentItemInput } from '~/utils/contentValidation'

const props = defineProps<{
  errors?: Partial<Record<keyof ContentItemFormInput, string>>
  initialValue?: ContentItemFormInput
  topics: Topic[]
}>()

const emit = defineEmits<{
  submit: [value: ContentItemFormInput]
}>()

const values = reactive<ContentItemFormInput>({
  body: '',
  is_active: false,
  slug: '',
  title: '',
  topic_id: '',
  ...props.initialValue
})
const fieldErrors = ref<Partial<Record<keyof ContentItemFormInput, string>>>({})
const visibleErrors = computed(() => ({
  ...props.errors,
  ...fieldErrors.value
}))

function submit() {
  const validation = validateContentItemInput(values)
  fieldErrors.value = validation.errors

  if (Object.keys(validation.errors).length === 0) {
    emit('submit', validation.value)
  }
}
</script>

<template>
  <form class="admin-content-form" novalidate @submit.prevent="submit">
    <div class="form-field">
      <label for="content-title">Title</label>
      <input
        id="content-title"
        v-model="values.title"
        :aria-describedby="
          visibleErrors.title ? 'content-title-error' : undefined
        "
        :aria-invalid="Boolean(visibleErrors.title)"
        name="title"
        required
        type="text"
      />
      <p
        v-if="visibleErrors.title"
        id="content-title-error"
        class="field-error"
      >
        {{ visibleErrors.title }}
      </p>
    </div>

    <div class="form-field">
      <label for="content-slug">URL slug</label>
      <input
        id="content-slug"
        v-model="values.slug"
        :aria-describedby="
          visibleErrors.slug ? 'content-slug-error' : undefined
        "
        :aria-invalid="Boolean(visibleErrors.slug)"
        name="slug"
        required
        type="text"
      />
      <p v-if="visibleErrors.slug" id="content-slug-error" class="field-error">
        {{ visibleErrors.slug }}
      </p>
    </div>

    <div class="form-field">
      <label for="content-topic">Topic</label>
      <select
        id="content-topic"
        v-model="values.topic_id"
        :aria-describedby="
          visibleErrors.topic_id ? 'content-topic-error' : undefined
        "
        :aria-invalid="Boolean(visibleErrors.topic_id)"
        name="topic"
        required
      >
        <option disabled value="">Select a topic</option>
        <option v-for="topic in topics" :key="topic.id" :value="topic.id">
          {{ topic.name }}
        </option>
      </select>
      <p
        v-if="visibleErrors.topic_id"
        id="content-topic-error"
        class="field-error"
      >
        {{ visibleErrors.topic_id }}
      </p>
    </div>

    <div class="form-field">
      <label for="content-body">Markdown content</label>
      <textarea
        id="content-body"
        v-model="values.body"
        :aria-describedby="
          visibleErrors.body ? 'content-body-error' : undefined
        "
        :aria-invalid="Boolean(visibleErrors.body)"
        name="body"
        required
        rows="12"
      />
      <p v-if="visibleErrors.body" id="content-body-error" class="field-error">
        {{ visibleErrors.body }}
      </p>
    </div>

    <label class="checkbox-field">
      <input v-model="values.is_active" type="checkbox" />
      Make this content visible to visitors
    </label>

    <button type="submit">Save content</button>
  </form>
</template>
