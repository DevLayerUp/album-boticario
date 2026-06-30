import { registerSocialShareMission } from "@/lib/mission-share";
import {
  buildShareTextWithImage,
  openPlatformShareUrl,
  shareToInstagram,
  tryCopyImageFile,
  tryShareImageFile,
  type SocialSharePlatform,
  type SocialShareResult,
} from "@/lib/social-share";

export function buildStickerShareText(displayName: string): string {
  const name = displayName.trim() || "Colecionador";
  return `Criei minha figurinha no álbum Fãs da Natureza! 🌿 — ${name}`;
}

export function buildStickerShareTextWithUrl(
  displayName: string,
  publicShareUrl: string,
): string {
  return buildStickerShareMessage(displayName, publicShareUrl);
}

export function buildStickerSharePageUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/figurinha`;
}

/** URL pública com og:image da figurinha — Facebook, X, LinkedIn, Telegram. */
export function buildStickerPublicShareUrl(origin: string, userId: string): string {
  return `${origin.replace(/\/$/, "")}/share/figurinha/${userId}`;
}

export function buildStickerShareMessage(
  displayName: string,
  publicShareUrl: string,
): string {
  return `${buildStickerShareText(displayName)} ${publicShareUrl}`;
}

/** Texto do WhatsApp — URL da imagem para preview inline + link público. */
export function buildStickerWhatsAppShareText(
  displayName: string,
  publicShareUrl: string,
  stickerImageUrl: string,
): string {
  return `${buildStickerShareText(displayName)}\n${stickerImageUrl}\n${publicShareUrl}`;
}

export async function fetchStickerImageFile(
  stickerUrl: string,
  fileName = "minha-figurinha.png",
): Promise<File> {
  const res = await fetch(stickerUrl);
  if (!res.ok) {
    throw new Error("Não foi possível carregar a imagem da figurinha.");
  }
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/png" });
}

export async function downloadSticker(
  stickerUrl: string,
  fileName = "minha-figurinha.png",
): Promise<void> {
  const file = await fetchStickerImageFile(stickerUrl, fileName);
  const objectUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export type StickerShareResult =
  | "shared"
  | "cancelled"
  | "unsupported"
  | "failed";

/** Compartilha via Web Share API (imagem + texto quando suportado). */
export async function shareStickerWithNativeApi(
  stickerUrl: string,
  displayName: string,
  publicShareUrl?: string,
): Promise<StickerShareResult> {
  if (typeof navigator.share !== "function") {
    return "unsupported";
  }

  const title = "Minha figurinha — Fãs da Natureza";
  const text = buildStickerShareText(displayName);
  const linkUrl = publicShareUrl ?? stickerUrl;

  try {
    const file = await fetchStickerImageFile(stickerUrl);
    const payloadWithFile: ShareData = { title, text, files: [file] };

    if (typeof navigator.canShare === "function" && navigator.canShare(payloadWithFile)) {
      await navigator.share(payloadWithFile);
      return "shared";
    }

    await navigator.share({
      title,
      text: buildStickerShareTextWithUrl(displayName, linkUrl),
      url: linkUrl,
    });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
    return "failed";
  }
}

/** Registra missão de compartilhamento social (se existir). */
export async function registerStickerShareMission(): Promise<boolean> {
  try {
    return await registerSocialShareMission();
  } catch {
    return false;
  }
}

export interface StickerPlatformShareOutcome {
  result: SocialShareResult;
  statusMessage?: string;
}

/**
 * Compartilha figurinha em rede específica com a imagem sempre incluída:
 * - mobile: Web Share API com arquivo de imagem
 * - WhatsApp/Telegram/X: URL da imagem no texto (preview inline)
 * - desktop: salva/copia imagem + abre rede social
 */
export async function shareStickerOnPlatform(
  platform: SocialSharePlatform,
  options: {
    stickerUrl: string;
    shareUrl: string;
    shareText: string;
    whatsAppText: string;
  },
): Promise<StickerPlatformShareOutcome> {
  const { stickerUrl, shareUrl, shareText, whatsAppText } = options;
  const shareTitle = "Minha figurinha — Fãs da Natureza";
  const textWithImage = buildShareTextWithImage(shareText, stickerUrl);

  try {
    const file = await fetchStickerImageFile(stickerUrl);

    if (platform === "whatsapp") {
      openPlatformShareUrl("whatsapp", shareUrl, shareText, {
        imageUrl: stickerUrl,
        whatsAppText,
      });
      return { result: "shared" };
    }

    if (platform === "instagram") {
      const igResult = await shareToInstagram({
        imageUrl: stickerUrl,
        shareText: textWithImage,
        fetchImageFile: fetchStickerImageFile,
        downloadImage: downloadSticker,
      });
      if (igResult === "shared") {
        return {
          result: "shared",
          statusMessage:
            "Imagem pronta! Publique nos Stories ou no feed do Instagram.",
        };
      }
      return { result: igResult };
    }

    // Mobile: envia arquivo de imagem pelo compartilhamento nativo
    const nativeResult = await tryShareImageFile({
      file,
      text: textWithImage,
      title: shareTitle,
    });
    if (nativeResult === "shared") return { result: "shared" };
    if (nativeResult === "cancelled") return { result: "cancelled" };

    // Fallback: imagem no texto + download/cópia para anexar manualmente
    const copied = await tryCopyImageFile(file);
    await downloadSticker(stickerUrl);

    openPlatformShareUrl(platform, shareUrl, shareText, { imageUrl: stickerUrl });

    if (copied) {
      return {
        result: "shared",
        statusMessage:
          "Figurinha copiada e salva! Cole a imagem (Ctrl+V) na publicação.",
      };
    }

    return {
      result: "shared",
      statusMessage: "Figurinha salva! Anexe a imagem à publicação.",
    };
  } catch {
    return { result: "failed" };
  }
}
