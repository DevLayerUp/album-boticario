"use client";

import { useCallback, useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import { useFeedbackToastOptional } from "@/components/ui/feedback-toast";
import {
  buildAlbumShareUrl,
  buildStickerPublicShareUrl,
  buildStickerShareMessage,
  buildStickerWhatsAppShareText,
  downloadSticker,
  registerStickerShareMission,
  shareStickerWithNativeApi,
} from "@/lib/sticker-share";
import { FigurinhaOutlineButton, FigurinhaPrimaryButton } from "./figurinha-actions";
import { cn } from "@/lib/utils";

interface StickerSharePanelProps {
  userId: string;
  stickerUrl: string;
  displayName: string;
  className?: string;
  variant?: "figurinha" | "profile";
}

export function StickerSharePanel({
  userId,
  stickerUrl,
  displayName,
  className,
  variant = "figurinha",
}: StickerSharePanelProps) {
  const [busy, setBusy] = useState(false);
  const [inlineStatus, setInlineStatus] = useState<string | null>(null);
  const feedbackToast = useFeedbackToastOptional();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicShareUrl = origin
    ? buildStickerPublicShareUrl(origin, userId)
    : `/share/figurinha/${userId}`;
  const albumUrl = origin ? buildAlbumShareUrl(origin) : "/album";
  const shareText = buildStickerShareMessage(displayName, publicShareUrl);
  const whatsAppText = buildStickerWhatsAppShareText(
    displayName,
    publicShareUrl,
    albumUrl,
  );
  const isProfile = variant === "profile";

  const completeShare = useCallback(async () => {
    await registerStickerShareMission();
    return true;
  }, []);

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

  async function nativeShare() {
    if (busy) return;
    setBusy(true);
    setInlineStatus(null);
    try {
      const result = await shareStickerWithNativeApi(
        stickerUrl,
        displayName,
        publicShareUrl,
        albumUrl,
      );
      if (result === "shared") {
        await registerStickerShareMission();
        showStatus("Compartilhado!", "success");
        return;
      }
      if (result === "cancelled") return;

      await downloadSticker(stickerUrl);
      await registerStickerShareMission();
      showStatus("Imagem salva! Envie pelo app da rede social.", "info");
    } catch {
      showStatus("Não foi possível compartilhar. Tente salvar a imagem.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    if (busy) return;
    setBusy(true);
    setInlineStatus(null);
    try {
      await downloadSticker(stickerUrl);
      await registerStickerShareMission();
      showStatus("Figurinha salva!", "success");
    } catch {
      showStatus("Não foi possível salvar. Tente novamente.", "error");
    } finally {
      setBusy(false);
    }
  }

  const primaryButton = (
    <FigurinhaPrimaryButton
      onClick={() => void nativeShare()}
      disabled={busy}
      className={cn(
        "w-full min-w-0 gap-2 shadow-lg shadow-black/15",
        isProfile && "h-10 text-sm",
      )}
    >
      {busy ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <Share2 className="size-4 shrink-0" aria-hidden />
      )}
      Compartilhar
    </FigurinhaPrimaryButton>
  );

  const socialRow = (
    <SocialShareButtons
      shareUrl={publicShareUrl}
      shareText={shareText}
      imageUrl={stickerUrl}
      whatsAppText={whatsAppText}
      disabled={busy}
      size={isProfile ? "sm" : "md"}
      tone="on-dark"
      hideNativeShare
      hidePlatforms={["instagram"]}
      onBeforeShare={completeShare}
      onNativeShare={nativeShare}
      onShareStatus={showStatus}
    />
  );

  const downloadAction = isProfile ? (
    <button
      type="button"
      onClick={() => void handleDownload()}
      disabled={busy}
      className="inline-flex cursor-pointer items-center justify-center gap-1.5 text-xs font-medium text-white/80 underline-offset-2 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="size-3.5 shrink-0" aria-hidden />
      Salvar imagem no dispositivo
    </button>
  ) : (
    <FigurinhaOutlineButton
      onClick={() => void handleDownload()}
      disabled={busy}
      className="inline-flex w-full min-w-0 gap-2"
    >
      <Download className="size-4 shrink-0" aria-hidden />
      Salvar imagem
    </FigurinhaOutlineButton>
  );

  if (isProfile) {
    return (
      <div
        className={cn(
          "w-full max-w-[min(100%,280px)] rounded-block border border-white/25 bg-white/10 p-3.5 shadow-lg shadow-black/10 backdrop-blur-md sm:p-4",
          className,
        )}
      >
        <div className="flex flex-col gap-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90">
            Compartilhar figurinha
          </p>

          {primaryButton}

          {socialRow}

          <div className="flex justify-center pt-0.5">{downloadAction}</div>

          {inlineStatus && !feedbackToast ? (
            <p
              className="rounded-pill bg-verde-escuro-500/40 px-3 py-1.5 text-center text-[11px] font-medium text-amarelo"
              role="status"
            >
              {inlineStatus}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col items-stretch gap-4 border-t border-white/15 pt-5",
        className,
      )}
    >
      <p className="text-center text-sm text-white/80">
        Compartilhe ou salve sua figurinha
      </p>

      {primaryButton}

      {downloadAction}

      {inlineStatus && !feedbackToast ? (
        <p className="text-center text-xs font-medium text-amarelo" role="status">
          {inlineStatus}
        </p>
      ) : null}
    </div>
  );
}
