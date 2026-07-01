"use client";

import { useCallback, useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { useFeedbackToastOptional } from "@/components/ui/feedback-toast";
import { shareAlbumCollection } from "@/lib/mission-share";
import { cn } from "@/lib/utils";

interface AlbumShareSectionProps {
  inFlipBook?: boolean;
  className?: string;
}

export function AlbumShareSection({ inFlipBook, className }: AlbumShareSectionProps) {
  const [busy, setBusy] = useState(false);
  const [inlineStatus, setInlineStatus] = useState<string | null>(null);
  const feedbackToast = useFeedbackToastOptional();

  const origin = typeof window !== "undefined" ? window.location.origin : "";

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
