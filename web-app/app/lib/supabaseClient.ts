import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = typeof process !== "undefined" && process.env.VITE_SUPABASE_URL
    ? process.env.VITE_SUPABASE_URL
    : (globalThis as any).SUPABASE_URL || "";

const SUPABASE_ANON_KEY = typeof process !== "undefined" && process.env.VITE_SUPABASE_ANON_KEY
    ? process.env.VITE_SUPABASE_ANON_KEY
    : (globalThis as any).SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);