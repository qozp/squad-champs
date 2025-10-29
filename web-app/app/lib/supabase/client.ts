import { createBrowserClient } from '@supabase/ssr'

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!
const VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!


export function createClient() {
  return createBrowserClient(
    VITE_SUPABASE_URL!,
    VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
}
