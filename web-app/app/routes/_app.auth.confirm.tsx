import { createSupabaseClient } from "app/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "react-router";
import type { Route } from "../+types/root";

export async function loader({ request }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const _next = requestUrl.searchParams.get("next");
  let next = _next || "/";
  try {
    const nextUrl = new URL(next, requestUrl.origin);
    if (nextUrl.origin !== requestUrl.origin) {
      next = "/";
    }
  } catch {
    next = "/";
  }

  const { supabase, headers } = createSupabaseClient(request);

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return redirect(next, { headers });
    } else {
      return redirect(`/auth/error?error=${error?.message}`);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect(next, { headers });
  }

  // redirect the user to an error page with some instructions
  return redirect(`/auth/error?error=Unable to authenticate`);
}
