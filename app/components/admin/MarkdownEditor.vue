<script setup lang="ts">
import { computed, ref } from 'vue'
import { renderMarkdown } from '~/utils/renderMarkdown'

const model = defineModel<string>({ default: '' })

const textarea = ref<HTMLTextAreaElement | null>(null)
const preview = computed(() => renderMarkdown(model.value))

function insert(before: string, after = '') {
  const element = textarea.value

  if (!element) {
    model.value += `${model.value ? '\n\n' : ''}${before}${after}`
    return
  }

  const start = element.selectionStart
  const end = element.selectionEnd
  const selected = model.value.slice(start, end)
  const replacement = `${before}${selected || 'text'}${after}`

  model.value = `${model.value.slice(0, start)}${replacement}${model.value.slice(end)}`

  requestAnimationFrame(() => {
    element.focus()
    const cursor = start + replacement.length - after.length
    element.setSelectionRange(cursor, cursor)
  })
}
</script>

<template>
  <div class="markdown-editor">
    <div class="markdown-editor-toolbar" aria-label="Markdown formatting tools">
      <UButton size="xs" type="button" variant="soft" @click="insert('# ')">
        Heading
      </UButton>
      <UButton
        size="xs"
        type="button"
        variant="soft"
        @click="insert('**', '**')"
      >
        Bold
      </UButton>
      <UButton size="xs" type="button" variant="soft" @click="insert('_', '_')">
        Emphasis
      </UButton>
      <UButton size="xs" type="button" variant="soft" @click="insert('- ')">
        List
      </UButton>
      <UButton size="xs" type="button" variant="soft" @click="insert('> ')">
        Quote
      </UButton>
      <UButton
        size="xs"
        type="button"
        variant="soft"
        @click="insert('[', '](https://example.com)')"
      >
        Link
      </UButton>
    </div>

    <div class="markdown-editor-panels">
      <div>
        <label for="content-body">Markdown content</label>
        <textarea
          id="content-body"
          ref="textarea"
          v-model="model"
          name="body"
          placeholder="Write the article in Markdown..."
          rows="18"
        />
      </div>
      <section
        aria-labelledby="markdown-preview-heading"
        class="markdown-preview"
      >
        <h3 id="markdown-preview-heading">Live preview</h3>
        <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown removes raw HTML and sanitizes output. -->
        <div class="markdown-content" v-html="preview" />
      </section>
    </div>
  </div>
</template>
