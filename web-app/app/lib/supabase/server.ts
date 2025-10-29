import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

export function createSupabaseClient(request: Request) {
  const headers = new Headers()

  const VITE_SUPABASE_URL = "https://ffenletsvfvbqvdbgdow.supabase.co"
  const VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZW5sZXRzdmZ2YnF2ZGJnZG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Njk5NDUsImV4cCI6MjA3NTU0NTk0NX0.dA1JCV2uDOkn10NqzHGbALJhZvm49Xwh9vwDeEC7ylk"


  const supabase = createServerClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
  // process.env.VITE_SUPABASE_URL!,
  // process.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '') as {
            name: string
            value: string
          }[]
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      },
    }
  )

  return { supabase, headers }
}
