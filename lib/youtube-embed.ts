/** Converte URL do YouTube (watch, youtu.be ou embed) em URL de iframe. */
export function getYoutubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes("/embed/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.replace(/^\//, "").split("/")[0] ?? null;
    } else if (parsed.hostname.includes("youtube.com")) {
      videoId =
        parsed.searchParams.get("v") ??
        parsed.pathname.match(/^\/embed\/([^/?]+)/)?.[1] ??
        parsed.pathname.match(/^\/shorts\/([^/?]+)/)?.[1] ??
        null;
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
