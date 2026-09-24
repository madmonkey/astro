import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | undefined

export function useSupabase(): SupabaseClient {
  const config = useRuntimeConfig()
  const { supabasePublishableKey, supabaseUrl } = config.public

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase is not configured. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    )
  }

  supabaseClient ??= createClient(supabaseUrl, supabasePublishableKey)

  return supabaseClient
}
