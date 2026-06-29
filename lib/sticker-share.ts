import { registerSocialShareMission } from "@/lib/mission-share";

export function buildStickerShareText(displayName: string): string {
  const name = displayName.trim() || "Colecionador";
  return `Criei minha figurinha no álbum Fãs da Natureza! 🌿 — ${name}`;
}

export function buildStickerShareTextWithUrl(
  displayName: string,
  stickerUrl: string,
): string {
  return `${buildStickerShareText(displayName)} ${stickerUrl}`;
}

export function buildStickerSharePageUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/figurinha`;
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
): Promise<StickerShareResult> {
  if (typeof navigator.share !== "function") {
    return "unsupported";
  }

  const title = "Minha figurinha — Fãs da Natureza";
  const text = buildStickerShareText(displayName);

  try {
    const file = await fetchStickerImageFile(stickerUrl);
    const payloadWithFile: ShareData = { title, text, files: [file] };

    if (typeof navigator.canShare === "function" && navigator.canShare(payloadWithFile)) {
      await navigator.share(payloadWithFile);
      return "shared";
    }

    await navigator.share({
      title,
      text: buildStickerShareTextWithUrl(displayName, stickerUrl),
      url: stickerUrl,
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
