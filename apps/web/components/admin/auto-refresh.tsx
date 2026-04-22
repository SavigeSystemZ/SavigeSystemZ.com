"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AdminAutoRefreshProps = {
  enabled: boolean;
  intervalMs?: number;
};

export function AdminAutoRefresh({ enabled, intervalMs = 30_000 }: AdminAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs, router]);

  return null;
}
