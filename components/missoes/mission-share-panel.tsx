"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Link2, MessageCircle, Share2 } from "lucide-react";
import {
  buildAlbumShareText,
  buildAlbumShareUrl,
  registerSocialShareMission,
} from "@/lib/mission-share";

interface MissionSharePanelProps {
  onComplete?: () => void;
}

export function MissionSharePanel({ onComplete }: MissionSharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? buildAlbumShareUrl(window.location.origin)
      : "/album";
  const shareText = buildAlbumShareText(shareUrl);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const markCopied = useCallback(() => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, []);

  async function completeShare() {
    if (submitting) return false;
    setSubmitting(true);
    try {
      const ok = await registerSocialShareMission();
      if (ok) onComplete?.();
      return ok;
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareText);
      markCopied();
      await completeShare();
    } catch {
      /* fallback silencioso */
    }
  }

  async function nativeShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Meu Álbum — Fãs da Natureza",
          text: shareText,
          url: shareUrl,
        });
        await completeShare();
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copyLink();
  }

  async function shareViaWhatsApp() {
    const ok = await completeShare();
    if (ok) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="w-full space-y-2 rounded-block border border-verde-500/20 bg-verde-100/50 p-2.5 sm:space-y-2.5 sm:p-3">
      <p className="text-left text-xs text-verde-escuro-500 sm:text-sm">
        Compartilhe o link do seu álbum. A missão é concluída ao copiar ou enviar o convite.
      </p>

      <div className="flex gap-1.5 sm:gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-pill border border-verde-200 bg-white px-2.5 py-1 text-[11px] text-verde-escuro-500 sm:px-3 sm:py-1.5 sm:text-xs">
          <Link2 className="size-3 shrink-0 text-verde-500/60" aria-hidden />
          <span className="truncate font-medium">{shareUrl}</span>
        </div>
        <button
          type="button"
          onClick={() => void copyLink()}
          disabled={submitting}
          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-pill bg-verde-escuro-500 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-verde-500 disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
          {copied ? "Ok" : "Copiar"}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        <button
          type="button"
          onClick={() => void shareViaWhatsApp()}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-pill border border-verde-500/25 bg-white px-2.5 py-1 text-[11px] font-medium text-verde-escuro-500 transition-colors hover:bg-white/80 disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          <MessageCircle className="size-3 text-[#25D366]" aria-hidden />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => void nativeShare()}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-pill border border-verde-500/25 bg-white px-2.5 py-1 text-[11px] font-medium text-verde-escuro-500 transition-colors hover:bg-white/80 disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          <Share2 className="size-3" aria-hidden />
          Compartilhar
        </button>
      </div>
    </div>
  );
}
