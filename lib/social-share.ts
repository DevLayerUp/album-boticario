export type SocialSharePlatform =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "telegram";

export type SocialShareResult = "shared" | "cancelled" | "unsupported" | "failed";

export function buildShareTextWithImage(shareText: string, imageUrl: string): string {
  if (shareText.includes(imageUrl)) return shareText;
  return `${shareText}\n${imageUrl}`;
}

export function buildSocialShareUrl(
  platform: SocialSharePlatform,
  shareUrl: string,
  shareText: string,
  options?: { imageUrl?: string; whatsAppText?: string },
): string | null {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const waText = encodeURIComponent(
    options?.whatsAppText ?? `${shareText}\n${shareUrl}`,
  );

  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${waText}`;
    case "instagram":
      return null;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  }
}

function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/** Abre o Instagram para publicar Stories (após salvar imagem 9:16). */
export function openInstagramStories(): void {
  if (isMobileUserAgent()) {
    window.location.href = "instagram://story-camera";
    return;
  }
  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
}

export function openPlatformShareUrl(
  platform: Exclude<SocialSharePlatform, "instagram">,
  shareUrl: string,
  shareText: string,
  options?: { imageUrl?: string; whatsAppText?: string },
): void {
  const url = buildSocialShareUrl(platform, shareUrl, shareText, options);
  if (!url) return;

  if (isMobileUserAgent()) {
    window.location.href = url;
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
