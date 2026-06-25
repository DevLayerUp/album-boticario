export type SocialSharePlatform =
  | "whatsapp"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "telegram";

export function buildSocialShareUrl(
  platform: SocialSharePlatform,
  shareUrl: string,
  shareText: string,
): string {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${encodedText}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodedText}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  }
}
