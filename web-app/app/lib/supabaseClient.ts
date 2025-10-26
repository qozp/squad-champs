import { createBrowserClient } from "@supabase/ssr";

// Existing client for local dev / browser
export const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Const version of createSupabase for server-side / SSR usage
export const createSupabase = (env: any) => {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase URL and key are required!");
    }

    return createBrowserClient(supabaseUrl, supabaseKey);
};