// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/astro/'
  },
  modules: ['@nuxt/eslint'],
  nitro: {
    preset: 'github_pages'
  },
  runtimeConfig: {
    public: {
      supabasePublishableKey:
        process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL ?? ''
    }
  }
})
