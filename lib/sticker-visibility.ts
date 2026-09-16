/** Detects PostgREST/Postgres errors for a missing `stickers.is_public` column. */
export function isMissingStickerPublicColumn(
  error: { message?: string; code?: string } | null | undefined,
): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  const looksMissing =
    error.code === "42703" ||
    /is_public/i.test(message) ||
    /schema cache/i.test(message);
  if (!looksMissing) return false;
  if (/album_pages/i.test(message) && !/stickers/i.test(message)) return false;
  return true;
}

export function stickerIsPublic(sticker: { is_public?: boolean | null }): boolean {
  return sticker.is_public !== false;
}

export function excludePrivateStickers<T extends { is_public?: boolean | null }>(
  stickers: T[],
): T[] {
  return stickers.filter(stickerIsPublic);
}
