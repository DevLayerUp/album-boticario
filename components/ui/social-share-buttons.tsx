"use client";

import { Share2 } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { buildSocialShareUrl, type SocialSharePlatform } from "@/lib/social-share";
import { shareStickerOnPlatform } from "@/lib/sticker-share";
import { cn } from "@/lib/utils";

const SOCIAL_SHARE_OPTIONS: {
  platform: SocialSharePlatform;
  label: string;
  Icon: typeof FaWhatsapp;
  color: string;
}[] = [
  { platform: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, color: "#25D366" },
  {
    platform: "instagram",
    label: "Instagram Stories",
    Icon: FaInstagram,
    color: "#E4405F",
  },
  { platform: "facebook", label: "Facebook", Icon: FaFacebookF, color: "#1877F2" },
  { platform: "twitter", label: "X", Icon: FaXTwitter, color: "#0F172A" },
  { platform: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2" },
  { platform: "telegram", label: "Telegram", Icon: FaTelegram, color: "#26A5E4" },
];

interface SocialShareButtonsProps {
  shareUrl: string;
  shareText: string;
  /** Quando informado, compartilha a figurinha em todas as redes. */
  imageUrl?: string;
  whatsAppText?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  tone?: "light" | "on-dark";
  hideNativeShare?: boolean;
  /** Redes que não devem aparecer (ex.: ocultar Instagram no compartilhar figurinha/álbum). */
  hidePlatforms?: SocialSharePlatform[];
  className?: string;
  onBeforeShare?: () => void | Promise<boolean | void>;
  onNativeShare: () => void | Promise<void>;
  onShareStatus?: (message: string) => void;
}

export function SocialShareButtons({
  shareUrl,
  shareText,
  imageUrl,
  whatsAppText,
  disabled = false,
  size = "sm",
  tone = "light",
  hideNativeShare = false,
  hidePlatforms,
  className,
  onBeforeShare,
  onNativeShare,
  onShareStatus,
}: SocialShareButtonsProps) {
  const visibleOptions = SOCIAL_SHARE_OPTIONS.filter(
    (option) => !hidePlatforms?.includes(option.platform),
  );
  const socialCount = visibleOptions.length;
  const gridColsClass =
    socialCount <= 5 ? "grid-cols-5" : socialCount <= 6 ? "grid-cols-6" : "grid-cols-7";
  const nativeColSpanClass =
    socialCount <= 5 ? "col-span-5" : socialCount <= 6 ? "col-span-6" : "col-span-7";
  const smGridColsClass =
    !hideNativeShare &&
    (socialCount <= 5 ? "sm:grid-cols-6" : socialCount <= 6 ? "sm:grid-cols-7" : "sm:grid-cols-8");

  const buttonSize =
    size === "md" ? "size-11 min-w-11" : "size-10 min-w-10 sm:size-11 sm:min-w-11";
  const iconSize = size === "md" ? "size-4" : "size-3.5 sm:size-4";

  const buttonClass =
    tone === "on-dark"
      ? "border-white/30 bg-white/95 text-verde-escuro-500 shadow-sm hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      : "border-verde-500/20 bg-white text-verde-escuro-500 shadow-sm hover:border-verde-500/40 hover:bg-verde-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-500";

  async function shareViaPlatform(platform: SocialSharePlatform) {
    if (onBeforeShare) {
      const proceed = await onBeforeShare();
      if (proceed === false) return;
    }

    if (imageUrl && whatsAppText) {
      const { result, statusMessage } = await shareStickerOnPlatform(platform, {
        stickerUrl: imageUrl,
        shareUrl,
        shareText,
        whatsAppText,
      });

      if (statusMessage) onShareStatus?.(statusMessage);
      if (result === "failed") {
        onShareStatus?.("Não foi possível compartilhar. Tente salvar a imagem.");
      }
      return;
    }

    const url = buildSocialShareUrl(platform, shareUrl, shareText, { whatsAppText });
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      className={cn("grid w-full gap-2", gridColsClass, smGridColsClass, className)}
      role="group"
      aria-label="Redes sociais"
    >
      {visibleOptions.map(({ platform, label, Icon, color }) => (
        <button
          key={platform}
          type="button"
          onClick={() => void shareViaPlatform(platform)}
          disabled={disabled}
          aria-label={`Compartilhar no ${label}`}
          className={cn(
            "inline-flex cursor-pointer items-center justify-center rounded-full border transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
            buttonSize,
            buttonClass,
          )}
        >
          <Icon className={cn("shrink-0", iconSize)} style={{ color }} aria-hidden />
        </button>
      ))}

      {!hideNativeShare ? (
        <button
          type="button"
          onClick={() => void onNativeShare()}
          disabled={disabled}
          aria-label="Mais opções de compartilhamento"
          className={cn(
            "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:px-0",
            nativeColSpanClass,
            buttonClass,
          )}
        >
          <Share2 className={iconSize} aria-hidden />
          <span className="sm:sr-only">Mais</span>
        </button>
      ) : null}
    </div>
  );
}
