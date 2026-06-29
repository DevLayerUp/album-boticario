const loadedUrls = new Set<string>();
const preloadPromises = new Map<string, Promise<boolean>>();

export function isPackOpeningGifPreloaded(url: string | null | undefined): boolean {
  if (!url) return true;
  return loadedUrls.has(url);
}

/** Warm the browser cache for the pack opening GIF before the user taps "Abrir". */
export function preloadPackOpeningGif(
  url: string | null | undefined,
): Promise<boolean> {
  if (!url || typeof window === "undefined") return Promise.resolve(!url);

  if (loadedUrls.has(url)) return Promise.resolve(true);

  const existing = preloadPromises.get(url);
  if (existing) return existing;

  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    const finish = (ok: boolean) => {
      if (ok) loadedUrls.add(url);
      preloadPromises.delete(url);
      resolve(ok);
    };

    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;

    if (img.complete && img.naturalWidth > 0) finish(true);
  });

  preloadPromises.set(url, promise);
  return promise;
}
