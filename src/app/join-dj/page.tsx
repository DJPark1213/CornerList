import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinDjWizard } from "@/features/join-dj";
import SignInToJoin from "@/features/join-dj/components/SignInToJoin";

export default async function JoinDjPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main>
        <SignInToJoin />
      </main>
    );
  }

  const { data: existing } = await supabase
    .from("dj_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) redirect("/djs/me");

  return (
    <main>
      <JoinDjWizard />
    </main>
  );
}
