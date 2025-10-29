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
} from "react-router";

export function meta() {
  return [{ title: "Login - Squad Champs" }];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = createSupabaseClient(request);

  const formData = await request.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("No user found");

  const { data: profileData, error: profileError } = await supabase.rpc(
    "get_profile",
    { user_id: data.user.id }
  );

  if (profileError) throw new Error(profileError.message);

  console.log(profileData);
  if (profileData.length == 0) {
    return redirect("/profile", { headers });
  }

  // Update this route to redirect to an authenticated route. The user already has an active session.
  return redirect("/", { headers });
};

export default function Login() {
  const fetcher = useFetcher<typeof action>();
  const loading = fetcher.state === "submitting";

  return (
    <div className="flex min-h-auto w-full items-center justify-center p-6 md:-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
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
