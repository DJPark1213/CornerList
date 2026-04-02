import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const origin =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: djProfile } = await supabase
      .from("dj_profiles")
      .select("id, stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!djProfile) {
      return NextResponse.json({ error: "DJ profile not found" }, { status: 404 });
    }

    const stripe = getStripe();
    let accountId = djProfile.stripe_account_id;

    // Create a new Express account if one doesn't exist
    if (!accountId) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();

      const account = await stripe.accounts.create({
        type: "express",
        email: prof?.email ?? undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      await supabase
        .from("dj_profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", djProfile.id);
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/djs/me?stripe=refresh`,
      return_url: `${origin}/djs/me?stripe=connected`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: djProfile } = await supabase
      .from("dj_profiles")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!djProfile?.stripe_account_id) {
      return NextResponse.json({ connected: false });
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(djProfile.stripe_account_id);

    return NextResponse.json({
      connected: account.charges_enabled && account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ connected: false });
  }
}
