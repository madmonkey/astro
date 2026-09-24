import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

const localEnvironment = loadEnv('development', process.cwd(), '')
const supabasePublishableKey =
  process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  localEnvironment.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  'test-publishable-key'
const supabaseUrl =
  process.env.NUXT_PUBLIC_SUPABASE_URL ??
  localEnvironment.NUXT_PUBLIC_SUPABASE_URL ??
  'http://supabase.test'

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  reporter: 'html',
  retries: process.env.CI ? 2 : 0,
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000/astro/',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    env: {
      NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
      NUXT_PUBLIC_SUPABASE_URL: supabaseUrl
    },
    reuseExistingServer: !process.env.CI,
    url: 'http://localhost:3000/astro/'
  },
  workers: process.env.CI ? 1 : undefined
})
