import { createSupabaseClient } from "app/lib/supabase/server";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Input } from "app/components/ui/input";
import { Label } from "app/components/ui/label";
import {
  type ActionFunctionArgs,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router";
import { requireAuth } from "~/lib/requireAuth";
import type { Route } from "../+types/root";

export function meta() {
  return [{ title: "Login - Squad Champs" }];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase } = createSupabaseClient(request);
  const { data, error } = await supabase.auth.getUser();

  if (error) return;
  if (data?.user) {
    return redirect("/home");
  }
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const APP_URL = context.cloudflare.env.APP_URL;
  const { supabase, headers } = createSupabaseClient(request);
  const formData = await request.formData();

  // Handle Google OAuth
  if (formData.get("_action") === "google") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${APP_URL}/auth/confirm`, // You can adjust this
      },
    });

    if (error) return { error: error.message };

    // Supabase returns a URL to redirect the browser to Google
    return redirect(data.url!, { headers });
  }

  // email
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  // Update this route to redirect to an authenticated route. The user already has an active session.
  return redirect("/home", { headers });
};

export default function Login() {
  const fetcher = useFetcher<typeof action>();
  const loading = fetcher.state === "submitting";
  const error = fetcher.data?.error;

  console.log("test");
  console.log(`${process.env.APP_URL}/auth/callback`);

  return (
    <div className="flex min-h-auto w-full items-center justify-center p-6 md:-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription className="">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <fetcher.Form method="post">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to="/forgot-password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  {/* ---- Separator ---- */}
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-border"></div>
                    <span className="text-sm text-muted-foreground">
                      Or continue with
                    </span>
                    <div className="h-px flex-1 bg-border"></div>
                  </div>

                  {/* ---- Google LOGIN ---- */}
                  <Button
                    type="submit"
                    name="_action"
                    value="google"
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Button>
                </div>
                {/* Sign up */}
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </fetcher.Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
