import { createBrowserClient } from '@supabase/ssr'

const VITE_SUPABASE_URL = "https://ffenletsvfvbqvdbgdow.supabase.co"
const VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZW5sZXRzdmZ2YnF2ZGJnZG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Njk5NDUsImV4cCI6MjA3NTU0NTk0NX0.dA1JCV2uDOkn10NqzHGbALJhZvm49Xwh9vwDeEC7ylk"

// const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!
// const VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!


export function createClient() {
  return createBrowserClient(
    VITE_SUPABASE_URL!,
    VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
}
