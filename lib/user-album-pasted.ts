type AlbumSlotRef =
  | { sticker_id: number | null }
  | { sticker_id: number | null }[]
  | null;

export type UserAlbumPastedRow = {
  sticker_id: number | null;
  album_slots?: AlbumSlotRef;
};

/** Resolves pasted sticker ids from user_album, falling back to the slot's sticker. */
export function collectPastedStickerIds(rows: UserAlbumPastedRow[]): Set<number> {
  const ids = new Set<number>();

  for (const row of rows) {
    if (row.sticker_id != null) {
      ids.add(row.sticker_id);
      continue;
    }

    const slot = Array.isArray(row.album_slots) ? row.album_slots[0] : row.album_slots;
    if (slot?.sticker_id != null) {
      ids.add(slot.sticker_id);
    }
  }

  return ids;
}
