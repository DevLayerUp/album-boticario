/** Detects PostgREST/Postgres errors for a missing `album_pages.is_public` column. */
export function isMissingAlbumPagePublicColumn(
  error: { message?: string; code?: string } | null | undefined,
): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  return error.code === "42703" || /is_public/i.test(message);
}

export function albumPageIsPublic(page: { is_public?: boolean | null }): boolean {
  return page.is_public !== false;
}
