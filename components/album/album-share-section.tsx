"use client";

import { useCallback, useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import { useFeedbackToastOptional } from "@/components/ui/feedback-toast";
import {
  buildAlbumShareText,
  buildAlbumShareUrl,
  registerSocialShareMission,
  shareAlbumCollection,
} from "@/lib/mission-share";
import { cn } from "@/lib/utils";

interface AlbumShareSectionProps {
  inFlipBook?: boolean;
  className?: string;
}

function ShareDivider({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex w-full items-center", compact ? "gap-2" : "gap-3")}>
      <span className="h-px flex-1 bg-white/20" aria-hidden />
      <span
        className={cn(
          "shrink-0 font-medium uppercase tracking-[0.12em] text-white/55",
          compact ? "text-[9px]" : "text-[10px]",
        )}
      >
        ou envie por
      </span>
      <span className="h-px flex-1 bg-white/20" aria-hidden />
    </div>
  );
}

export function AlbumShareSection({ inFlipBook, className }: AlbumShareSectionProps) {
  const [busy, setBusy] = useState(false);
  const [inlineStatus, setInlineStatus] = useState<string | null>(null);
  const feedbackToast = useFeedbackToastOptional();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const albumUrl = origin ? buildAlbumShareUrl(origin) : "/album";
  const shareText = buildAlbumShareText(albumUrl);

  const showStatus = useCallback(
    (message: string, variant: "success" | "error" | "info" = "info") => {
      if (feedbackToast) {
        feedbackToast.showToast({ message, variant });
        return;
      }
      setInlineStatus(message);
      window.setTimeout(() => setInlineStatus(null), 3000);
    },
    [feedbackToast],
  );

  async function handleNativeShare() {
    if (busy || !origin) return;
    setBusy(true);
    try {
      const result = await shareAlbumCollection(origin);
      if (result === "shared") {
        showStatus("Álbum compartilhado!", "success");
      } else if (result === "copied") {
        showStatus("Link copiado!", "success");
      } else if (result === "failed") {
        showStatus("Não foi possível compartilhar. Tente novamente.", "error");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onBeforeShare() {
    await registerSocialShareMission();
    return true;
  }

  return (
    <section
      aria-label="Compartilhar álbum"
      className={cn(
        "flex w-full max-w-[min(100%,340px)] flex-col items-center",
        inFlipBook ? "gap-2.5 pt-1" : "gap-3 pt-2 sm:max-w-[380px] sm:gap-4 sm:pt-3",
        className,
      )}
    >
      <p
        className={cn(
          "text-center font-semibold text-white",
          inFlipBook ? "text-xs sm:text-sm" : "text-sm sm:text-base",
        )}
      >
        Compartilhe seu álbum
      </p>

      <button
        type="button"
        onClick={() => void handleNativeShare()}
        disabled={busy}
        className={cn(
          "inline-flex w-full max-w-full items-center justify-center gap-2 rounded-pill bg-amarelo font-medium text-verde-escuro-500 transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60",
          inFlipBook ? "px-5 py-2 text-xs sm:px-6 sm:text-sm" : "px-8 py-2.5 text-sm sm:text-base",
        )}
      >
        {busy ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Share2 className="size-4 shrink-0" aria-hidden />
        )}
        Compartilhar álbum
      </button>

      <ShareDivider compact={inFlipBook} />

      <SocialShareButtons
        shareUrl={albumUrl}
        shareText={shareText}
        whatsAppText={shareText}
        disabled={busy}
        size={inFlipBook ? "sm" : "md"}
        tone="on-dark"
        hideNativeShare
        hidePlatforms={["instagram"]}
        onBeforeShare={onBeforeShare}
        onNativeShare={handleNativeShare}
        onShareStatus={(message) => showStatus(message, "info")}
        className={inFlipBook ? "max-w-[280px]" : undefined}
      />

      {inlineStatus && !feedbackToast ? (
        <p
          className="rounded-pill bg-verde-escuro-500/40 px-3 py-1.5 text-center text-[11px] font-medium text-amarelo"
          role="status"
        >
          {inlineStatus}
        </p>
      ) : null}
    </section>
  );
}
