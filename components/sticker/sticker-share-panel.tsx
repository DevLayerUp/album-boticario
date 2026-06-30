"use client";

import { useCallback, useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { SocialShareButtons } from "@/components/ui/social-share-buttons";
import {
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

function ShareDivider({ onDark }: { onDark?: boolean }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span
        className={cn("h-px flex-1", onDark ? "bg-white/20" : "bg-white/15")}
        aria-hidden
      />
      <span
        className={cn(
          "shrink-0 text-[10px] font-medium uppercase tracking-[0.14em]",
          onDark ? "text-white/55" : "text-white/50",
        )}
      >
        ou envie por
      </span>
      <span
        className={cn("h-px flex-1", onDark ? "bg-white/20" : "bg-white/15")}
        aria-hidden
      />
    </div>
  );
}

export function StickerSharePanel({
  userId,
  stickerUrl,
  displayName,
  className,
  variant = "figurinha",
}: StickerSharePanelProps) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicShareUrl = origin
    ? buildStickerPublicShareUrl(origin, userId)
    : `/share/figurinha/${userId}`;
  const shareText = buildStickerShareMessage(displayName, publicShareUrl);
  const whatsAppText = buildStickerWhatsAppShareText(
    displayName,
    publicShareUrl,
    stickerUrl,
  );
  const isProfile = variant === "profile";

  const completeShare = useCallback(async () => {
    await registerStickerShareMission();
    return true;
  }, []);

  const showStatus = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 3000);
  }, []);

  async function nativeShare() {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await shareStickerWithNativeApi(
        stickerUrl,
        displayName,
        publicShareUrl,
      );
      if (result === "shared") {
        await registerStickerShareMission();
        showStatus("Compartilhado!");
        return;
      }
      if (result === "cancelled") return;

      await downloadSticker(stickerUrl);
      await registerStickerShareMission();
      showStatus("Imagem salva! Envie pelo app da rede social.");
    } catch {
      showStatus("Não foi possível compartilhar. Tente salvar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      await downloadSticker(stickerUrl);
      await registerStickerShareMission();
      showStatus("Figurinha salva!");
    } catch {
      showStatus("Não foi possível salvar. Tente novamente.");
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

          <ShareDivider onDark />

          {socialRow}

          <div className="flex justify-center pt-0.5">{downloadAction}</div>

          {status ? (
            <p
              className="rounded-pill bg-verde-escuro-500/40 px-3 py-1.5 text-center text-[11px] font-medium text-amarelo"
              role="status"
            >
              {status}
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
        Compartilhe sua figurinha nas redes sociais
      </p>

      {primaryButton}

      <ShareDivider />

      {socialRow}

      {downloadAction}

      {status ? (
        <p className="text-center text-xs font-medium text-amarelo" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
