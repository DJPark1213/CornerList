"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function getAvatarUrl(user: User): string | null {
  const m = user.user_metadata;
  if (!m || typeof m !== "object") return null;
  const picture = (m as { picture?: unknown; avatar_url?: unknown }).picture;
  const avatarUrl = (m as { picture?: unknown; avatar_url?: unknown })
    .avatar_url;
  const url =
    typeof picture === "string" && picture.length > 0
      ? picture
      : typeof avatarUrl === "string" && avatarUrl.length > 0
        ? avatarUrl
        : null;
  return url;
}

function getInitials(displayName: string, email: string | undefined): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.length >= 2) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .maybeSingle();
        const r = prof?.role ?? null;
        setRole(r);

        if (r === "dj") {
          const res = await fetch("/api/bookings?asDj=1");
          const j = (await res.json()) as { bookings?: { status: string }[] };
          const count = (j.bookings ?? []).filter(
            (b) => b.status === "pending",
          ).length;
          setPendingCount(count);
        }
      }
      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        setRole(null);
        setPendingCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname === href
        ? "text-foreground font-medium"
        : "text-muted hover:text-foreground"
    }`;

  const handleSignIn = async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "Account";

  const avatarUrl = user ? getAvatarUrl(user) : null;
  const initials = user
    ? getInitials(
        String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""),
        user.email ?? undefined,
      )
    : "?";

  const showName =
    displayName && displayName !== "Account" ? displayName : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
        >
          <span className="text-primary">♪</span>
          <span>CornerList</span>
        </Link>

        <nav className="flex items-center gap-6">
          {user && role !== "dj" && role !== "admin" && (
            <Link href="/bookings" className={linkClass("/bookings")}>
              My Bookings
            </Link>
          )}
          {role === "dj" && (
            <Link href="/djs/me" className={`relative ${linkClass("/djs/me")}`}>
              My Profile
              {pendingCount > 0 && (
                <span className="absolute -right-3.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          {role === "admin" && (
            <Link href="/admin" className={linkClass("/admin")}>
              Admin
            </Link>
          )}
          {role !== "dj" && role !== "admin" && (
            <Link href="/join-dj" className={linkClass("/join-dj")}>
              Join as a DJ
            </Link>
          )}
          <Link href="/faq" className={linkClass("/faq")}>
            FAQ
          </Link>
          {loading ? (
            <span className="h-9 w-24 animate-pulse rounded-full bg-surface-light" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={showName ? `${showName} profile photo` : "Profile photo"}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                  data-testid="user-avatar"
                />
              ) : (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-primary/15 text-xs font-semibold text-primary-hover"
                  data-testid="user-avatar-fallback"
                  aria-hidden
                >
                  {initials}
                </div>
              )}
              {showName && (
                <span
                  className="hidden max-w-[120px] truncate text-sm text-muted sm:inline"
                  title={showName}
                >
                  {showName}
                </span>
              )}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary sm:px-4"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleSignIn()}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
