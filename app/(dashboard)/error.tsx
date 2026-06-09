"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gb-green-deep">
        <svg
          aria-hidden
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          stroke="#d9a441"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M20 12v10M20 28h.01" />
          <circle cx="20" cy="20" r="16" strokeOpacity="0.5" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-gb-ink">
          Algo deu errado
        </h2>
        <p className="max-w-sm text-gb-slate">
          Ocorreu um erro ao carregar esta página. Tente novamente ou volte ao início.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-gb-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gb-green-dark focus-visible:outline-2"
        >
          Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-gb-ink transition-colors hover:bg-surface focus-visible:outline-2"
        >
          Ir ao início
        </Link>
      </div>
    </div>
  );
}
