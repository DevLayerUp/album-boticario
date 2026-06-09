import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      {/* Ilustração */}
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gb-green-deep">
        <svg
          aria-hidden
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          stroke="#00a859"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="10" y="8" width="28" height="36" rx="4" />
          <circle cx="24" cy="24" r="6" strokeOpacity="0.5" />
          <path d="M18 32c0-3.31 2.69-5 6-5s6 1.69 6 5" strokeOpacity="0.5" />
          <path d="M20 20l8 8M28 20l-8 8" stroke="#d9a441" />
        </svg>
      </div>

      <div className="space-y-2">
        <p className="font-display text-5xl font-semibold text-gb-green-deep">404</p>
        <h1 className="font-display text-xl font-semibold text-gb-ink">
          Figurinha não encontrada
        </h1>
        <p className="max-w-sm text-gb-slate">
          Parece que esta página não faz parte da coleção. Volte para o álbum e continue coletando!
        </p>
      </div>

      <Link
        href="/dashboard"
        className="rounded-full bg-gb-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gb-green-dark focus-visible:outline-2"
      >
        Voltar para o álbum
      </Link>
    </div>
  );
}
