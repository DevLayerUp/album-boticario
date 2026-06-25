"use client";

import { Share2 } from "lucide-react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import {
  buildSocialShareUrl,
  type SocialSharePlatform,
} from "@/lib/social-share";
import { cn } from "@/lib/utils";

const SOCIAL_SHARE_OPTIONS: {
  platform: SocialSharePlatform;
  label: string;
  Icon: typeof FaWhatsapp;
  color: string;
}[] = [
  { platform: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, color: "#25D366" },
  { platform: "facebook", label: "Facebook", Icon: FaFacebookF, color: "#1877F2" },
  { platform: "twitter", label: "X", Icon: FaXTwitter, color: "#000000" },
  { platform: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, color: "#0A66C2" },
  { platform: "telegram", label: "Telegram", Icon: FaTelegram, color: "#26A5E4" },
];

interface SocialShareButtonsProps {
  shareUrl: string;
  shareText: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  onBeforeShare?: () => void | Promise<boolean | void>;
  onNativeShare: () => void | Promise<void>;
}

export function SocialShareButtons({
  shareUrl,
  shareText,
  disabled = false,
  size = "sm",
  className,
  onBeforeShare,
  onNativeShare,
}: SocialShareButtonsProps) {
  const buttonSize = size === "md" ? "size-10" : "size-8 sm:size-9";
  const iconSize = size === "md" ? "size-4" : "size-3.5 sm:size-4";

  async function shareViaPlatform(platform: SocialSharePlatform) {
    if (onBeforeShare) {
      const proceed = await onBeforeShare();
      if (proceed === false) return;
    }
    const url = buildSocialShareUrl(platform, shareUrl, shareText);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={cn("flex flex-wrap justify-center gap-1.5", className)}>
      {SOCIAL_SHARE_OPTIONS.map(({ platform, label, Icon, color }) => (
        <button
          key={platform}
          type="button"
          onClick={() => void shareViaPlatform(platform)}
          disabled={disabled}
          aria-label={`Compartilhar no ${label}`}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-verde-500/25 bg-white transition-colors hover:bg-white/80 disabled:opacity-60",
            buttonSize,
          )}
        >
          <Icon className={cn("shrink-0", iconSize)} style={{ color }} aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={() => void onNativeShare()}
        disabled={disabled}
        aria-label="Compartilhar"
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-verde-500/25 bg-white text-verde-escuro-500 transition-colors hover:bg-white/80 disabled:opacity-60",
          buttonSize,
        )}
      >
        <Share2 className={iconSize} aria-hidden />
      </button>
    </div>
  );
}
