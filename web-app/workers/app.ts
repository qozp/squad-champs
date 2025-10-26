import { createRequestHandler } from "react-router";
import { createSupabase } from "~/lib/supabaseClient";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
      supabase?: ReturnType<typeof import("~/lib/supabaseClient").createSupabase>;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const supabase = createSupabase(env); // <- create client from Cloudflare vars
    return requestHandler(request, {
      cloudflare: { env, ctx, supabase }, // pass supabase to loaders/actions
    });
  },
} satisfies ExportedHandler<Env>;
