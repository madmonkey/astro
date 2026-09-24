import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  test: {
    coverage: {
      exclude: ['tests/**'],
      include: ['app/**/*.{ts,vue}'],
      provider: 'v8',
      reporter: ['text', 'html']
    },
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.ts'],
    passWithNoTests: true
  }
})
