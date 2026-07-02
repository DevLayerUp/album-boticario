export type SocialShareSource = "sticker" | "album" | "native";

export function buildAlbumShareUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/album`;
}

export function buildAlbumShareText(shareUrl: string): string {
  return `Confira meu álbum de figurinhas Fãs por Natureza! ${shareUrl}`;
}

export async function registerSocialShareMission(
  source: SocialShareSource,
): Promise<boolean> {
  const res = await fetch("/api/missions/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });
  return res.ok;
}

export async function shareAlbumCollection(
  origin: string,
): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  const shareUrl = buildAlbumShareUrl(origin);
  const shareText = buildAlbumShareText(shareUrl);

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "Meu Álbum — Fãs por Natureza",
        text: shareText,
        url: shareUrl,
      });
      const registered = await registerSocialShareMission("album");
      return registered ? "shared" : "failed";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    const registered = await registerSocialShareMission("album");
    return registered ? "copied" : "failed";
  } catch {
    return "failed";
  }
}
