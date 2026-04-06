"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignInToJoin() {
  const handleSignIn = async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/join-dj`,
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Join CornerList as a DJ</h1>
      <p className="mt-3 text-sm text-muted">
        You need to sign in before creating your DJ profile.
      </p>
      <button
        onClick={handleSignIn}
        className="mt-8 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
      >
        Sign in with Google to continue
      </button>
    </div>
  );
}
