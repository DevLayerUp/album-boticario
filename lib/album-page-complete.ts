import type { AlbumPageData } from "@/components/album/album-page";

export function getAssignedAlbumSlotIds(page: AlbumPageData): number[] {
  return (page.album_slots ?? [])
    .filter((slot) => slot.stickers != null)
    .map((slot) => slot.id);
}

export function isAlbumStickerPageComplete(
  page: AlbumPageData,
  pastedSlotIds: Set<number>,
): boolean {
  const assigned = getAssignedAlbumSlotIds(page);
  if (assigned.length === 0) return false;
  return assigned.every((id) => pastedSlotIds.has(id));
}

/** Página que acaba de ficar completa com esta colagem, ou null. */
export function findPageCompletedByPaste(
  pages: AlbumPageData[],
  pastedSlotIds: Set<number>,
  newlyPastedSlotId: number,
): AlbumPageData | null {
  const page = pages.find((item) =>
    (item.album_slots ?? []).some((slot) => slot.id === newlyPastedSlotId),
  );
  if (!page) return null;
  if (isAlbumStickerPageComplete(page, pastedSlotIds)) return null;

  const nextPasted = new Set(pastedSlotIds);
  nextPasted.add(newlyPastedSlotId);
  return isAlbumStickerPageComplete(page, nextPasted) ? page : null;
}
