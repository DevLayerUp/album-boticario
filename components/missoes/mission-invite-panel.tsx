"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Copy,
  Link2,
  Loader2,
  Users,
} from "lucide-react";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import type { ReferralSummary } from "@/lib/referrals";
import { buildShareText } from "@/lib/referrals";

interface MissionInvitePanelProps {
  progress: number;
  targetValue: number;
}

export function MissionInvitePanel({ progress, targetValue }: MissionInvitePanelProps) {
  const [data, setData] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/referrals")
      .then(async (res) => {
        const json = (await res.json()) as ReferralSummary & { error?: string };
        if (!res.ok) {
          throw new Error(json.error ?? "Não foi possível carregar seu convite");
        }
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar convite");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const markCopied = useCallback(() => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, []);

  const copyLink = useCallback(async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.invite_url);
      markCopied();
    } catch {
      /* fallback silencioso */
    }
  }, [data, markCopied]);

  const copyMessage = useCallback(async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(buildShareText(data.invite_url));
      markCopied();
    } catch {
      /* fallback silencioso */
    }
  }, [data, markCopied]);

  async function nativeShare() {
    if (!data) return;
    const shareText = buildShareText(data.invite_url);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Álbum Fãs da Natureza",
          text: shareText,
          url: data.invite_url,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copyMessage();
  }

  if (loading) {
    return (
      <div className="flex w-full justify-center py-3">
        <Loader2 className="size-6 animate-spin text-verde-500" aria-label="Carregando convite" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="w-full rounded-block bg-red-50 px-3 py-2 text-center text-xs text-red-700" role="alert">
        {error ?? "Não foi possível carregar seu link de convite."}
      </p>
    );
  }

  const shareText = buildShareText(data.invite_url);

  return (
    <div className="w-full space-y-2 rounded-block border border-verde-500/20 bg-verde-100/50 p-2.5 sm:space-y-2.5 sm:p-3">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-verde-500 text-white">
          <Users className="size-3.5" aria-hidden />
        </span>
        <p className="min-w-0 text-left text-xs font-semibold text-verde-escuro-500 sm:text-sm">
          {progress}/{targetValue} convites · código{" "}
          <span className="font-mono">{data.referral_code}</span>
        </p>
      </div>

      <div className="flex gap-1.5 sm:gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-pill border border-verde-200 bg-white px-2.5 py-1 text-[11px] text-verde-escuro-500 sm:px-3 sm:py-1.5 sm:text-xs">
          <Link2 className="size-3 shrink-0 text-verde-500/60" aria-hidden />
          <span className="truncate font-medium">{data.invite_url}</span>
        </div>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-pill bg-verde-escuro-500 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-verde-500 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
          {copied ? "Ok" : "Copiar"}
        </button>
      </div>

      <SocialShareButtons
        shareUrl={data.invite_url}
        shareText={shareText}
        onNativeShare={nativeShare}
      />
    </div>
  );
}
