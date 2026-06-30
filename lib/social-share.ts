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
  const textWithImage =
    options?.imageUrl && platform !== "whatsapp"
      ? buildShareTextWithImage(shareText, options.imageUrl)
      : shareText;
  const encodedText = encodeURIComponent(textWithImage);
  const waText = encodeURIComponent(
    options?.whatsAppText ?? `${shareText} ${shareUrl}`,
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

function openInstagramApp(): void {
  if (isMobileUserAgent()) {
    window.location.href = "instagram://camera";
    return;
  }
  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
}

/** Instagram não tem sharer web — compartilha imagem (Stories/feed) ou link copiado. */
export async function shareToInstagram(options: {
  imageUrl?: string;
  shareText: string;
  fetchImageFile?: (url: string) => Promise<File>;
  downloadImage?: (url: string) => Promise<void>;
}): Promise<SocialShareResult> {
  const { imageUrl, shareText, fetchImageFile, downloadImage } = options;

  if (imageUrl && fetchImageFile && downloadImage) {
    const fileShare = await tryShareImageFile({
      file: await fetchImageFile(imageUrl),
      text: shareText,
      title: "Minha figurinha — Fãs da Natureza",
    });
    if (fileShare === "shared") return "shared";
    if (fileShare === "cancelled") return "cancelled";

    try {
      await downloadImage(imageUrl);
      openInstagramApp();
      return "shared";
    } catch {
      return "failed";
    }
  }

  try {
    if (typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(shareText);
    }
    openInstagramApp();
    return "shared";
  } catch {
    return "failed";
  }
}

/** Compartilha arquivo de imagem via Web Share API (mobile). */
export async function tryShareImageFile(options: {
  file: File;
  text: string;
  title?: string;
}): Promise<SocialShareResult> {
  if (typeof navigator.share !== "function") {
    return "unsupported";
  }

  const payload: ShareData = {
    title: options.title ?? "Compartilhar",
    text: options.text,
    files: [options.file],
  };

  if (typeof navigator.canShare === "function" && !navigator.canShare(payload)) {
    return "unsupported";
  }

  try {
    await navigator.share(payload);
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
    return "failed";
  }
}

export async function tryCopyImageFile(file: File): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ [file.type || "image/png"]: file }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export function openPlatformShareUrl(
  platform: Exclude<SocialSharePlatform, "instagram">,
  shareUrl: string,
  shareText: string,
  options?: { imageUrl?: string; whatsAppText?: string },
): void {
  const url = buildSocialShareUrl(platform, shareUrl, shareText, options);
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
