import { createBrowserClient } from "@supabase/ssr";

// Existing client for local dev / browser
export const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);