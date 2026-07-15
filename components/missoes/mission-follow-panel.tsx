"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import { FOUNDATION_SOCIAL_LINKS, type FoundationSocialPlatform } from "@/lib/foundation-social-links";

const SOCIAL_ICON_MAP = {
  youtube: FaYoutube,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
} as const;

interface MissionFollowPanelProps {
  onComplete?: () => void;
}

export function MissionFollowPanel({ onComplete }: MissionFollowPanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmFollow() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/missions/follow", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Não foi possível registrar. Tente novamente.");
        return;
      }
      onComplete?.();
    } catch {
      setError("Não foi possível registrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-2.5 rounded-block border border-verde-500/20 bg-verde-100/50 p-2.5 sm:space-y-3 sm:p-3">
      <p className="text-left text-xs text-verde-escuro-500 sm:text-sm">
        Siga a Fundação Grupo Boticário em pelo menos uma rede social e confirme abaixo.
      </p>

      <ul className="grid gap-1.5 sm:gap-2">
        {FOUNDATION_SOCIAL_LINKS.map((link) => {
          const Icon = SOCIAL_ICON_MAP[link.platform as FoundationSocialPlatform];
          return (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-pill border border-verde-200 bg-white px-3 py-2 text-xs font-medium text-verde-escuro-500 transition-colors hover:bg-verde-50 sm:text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="size-4 shrink-0 text-verde-500" aria-hidden />
                  {link.label}
                </span>
                <ExternalLink className="size-3.5 shrink-0 text-verde-500/70" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 sm:text-sm">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={confirmFollow}
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-pill bg-verde-escuro-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-verde-escuro-400 disabled:opacity-60 sm:text-sm"
      >
        {submitting ? "Registrando…" : "Já sigo a Fundação"}
      </button>
    </div>
  );
}
