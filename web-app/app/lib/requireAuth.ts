// app/lib/requireAuth.ts
import { createClient } from "app/lib/supabase/server";
import { redirect } from "react-router";

export async function requireAuth(request: Request) {
    const { supabase } = createClient(request);

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        throw redirect("/login"); // ⛔ Throwing redirect is required for loaders
    }

    return data.user;
}
