import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      exclude: ['tests/**'],
      include: ['app/**/*.{ts,vue}'],
      provider: 'v8',
      reporter: ['text', 'html']
    },
    environment: 'jsdom',
    include: ['tests/{unit,component}/**/*.{test,spec}.ts'],
    passWithNoTests: true
  }
})
