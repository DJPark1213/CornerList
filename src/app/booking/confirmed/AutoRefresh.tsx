"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.refresh(), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return null;
}
