// app/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

const test_URL = "https://ffenletsvfvbqvdbgdow.supabase.co"
const test_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZW5sZXRzdmZ2YnF2ZGJnZG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Njk5NDUsImV4cCI6MjA3NTU0NTk0NX0.dA1JCV2uDOkn10NqzHGbALJhZvm49Xwh9vwDeEC7ylk"

// Function to initialize client
export const getSupabaseClient = (env?: any) => {
    if (!supabase) {
        // Local dev uses Vite env
        const url = test_URL
        const key = test_ANON_KEY
        // const url =
        //     env?.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        // const key =
        //     env?.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!url || !key) {
            throw new Error(
                "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!"
            );
        }

        // console.log(url, key)

        supabase = createClient(url, key);
    }

    return supabase;
};
