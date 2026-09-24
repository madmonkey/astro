import { defineConfig, devices } from '@playwright/test'

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
    reuseExistingServer: !process.env.CI,
    url: 'http://localhost:3000/astro/'
  },
  workers: process.env.CI ? 1 : undefined
})
