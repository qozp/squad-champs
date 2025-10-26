// app/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

// Function to initialize client
export const getSupabaseClient = (env?: any) => {
    if (!supabase) {
        // Local dev uses Vite env
        const url =
            (env?.SUPABASE_URL as string) ?? import.meta.env.VITE_SUPABASE_URL;
        const key =
            (env?.SUPABASE_KEY as string) ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!url || !key) {
            throw new Error(
                "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!"
            );
        }

        supabase = createClient(url, key);
    }

    return supabase;
};
