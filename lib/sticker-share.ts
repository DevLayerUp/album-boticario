import { registerSocialShareMission } from "@/lib/mission-share";
import {
  createStickerStoriesImage,
  downloadStickerStoriesFile,
} from "@/lib/sticker-stories-image";
import {
  openInstagramStories,
  openPlatformShareUrl,
  type SocialSharePlatform,
  type SocialShareResult,
} from "@/lib/social-share";

export function buildStickerShareText(displayName: string): string {
  const name = displayName.trim() || "Colecionador";
  return `Criei minha figurinha no álbum Fãs por Natureza! 🌿 — ${name}`;
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

export function buildAlbumShareUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/album`;
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

/**
 * WhatsApp: texto + links (figurinha e álbum).
 * A prévia da figurinha vem do OG da página pública — sem URL direta da imagem.
 */
export function buildStickerWhatsAppShareText(
  displayName: string,
  publicShareUrl: string,
  albumUrl: string,
): string {
  return [
    buildStickerShareText(displayName),
    "",
    `🌿 Minha figurinha: ${publicShareUrl}`,
    `📖 Álbum Fãs por Natureza: ${albumUrl}`,
  ].join("\n");
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

/** Compartilhamento geral — menu nativo do sistema (imagem + texto). */
export async function shareStickerWithNativeApi(
  stickerUrl: string,
  displayName: string,
  publicShareUrl?: string,
  albumUrl?: string,
): Promise<StickerShareResult> {
  if (typeof navigator.share !== "function") {
    return "unsupported";
  }

  const title = "Minha figurinha — Fãs por Natureza";
  const text = albumUrl
    ? buildStickerWhatsAppShareText(displayName, publicShareUrl ?? stickerUrl, albumUrl)
    : buildStickerShareText(displayName);
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
 * Cada botão abre a rede correspondente diretamente.
 * Instagram: imagem no formato Stories (1080×1920).
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

  try {
    if (platform === "whatsapp") {
      openPlatformShareUrl("whatsapp", shareUrl, shareText, { whatsAppText });
      return { result: "shared" };
    }

    if (platform === "instagram") {
      const storiesFile = await createStickerStoriesImage(stickerUrl);
      await downloadStickerStoriesFile(storiesFile);
      openInstagramStories();
      return {
        result: "shared",
        statusMessage:
          "Figurinha salva no formato Stories! Abra o Instagram, escolha a imagem na galeria e publique.",
      };
    }

    openPlatformShareUrl(platform, shareUrl, shareText);
    return { result: "shared" };
  } catch {
    return {
      result: "failed",
      statusMessage: "Não foi possível compartilhar. Tente salvar a imagem.",
    };
  }
}
