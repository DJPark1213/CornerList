"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname === href
        ? "text-foreground font-medium"
        : "text-muted hover:text-foreground"
    }`;

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
          <Link href="/join-dj" className={linkClass("/join-dj")}>
            Join as a DJ
          </Link>
          <Link href="/#" className="text-sm text-muted hover:text-foreground">
            FAQ
          </Link>
          <button className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}
