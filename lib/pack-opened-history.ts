import type { OpenedPackHistory, PackSticker } from "@/components/pacotinhos/types";

type OpenedPackRow = {
  id: number;
  source: string;
  opened_at: string;
  pack_stickers: {
    position: number;
    stickers: unknown;
  }[] | null;
};

export function normalizePackSticker(raw: unknown): PackSticker["stickers"] {
  if (!raw) return null;
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item || typeof item !== "object") return null;
  const sticker = item as PackSticker["stickers"];
  if (!sticker) return null;
  const rarities = Array.isArray(sticker.rarities)
    ? sticker.rarities[0] ?? null
    : sticker.rarities;
  return { ...sticker, rarities };
}

export function mapOpenedPackHistory(rows: OpenedPackRow[]): OpenedPackHistory[] {
  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    opened_at: row.opened_at,
    stickers: (row.pack_stickers ?? [])
      .sort((a, b) => a.position - b.position)
      .map((ps) => ({
        position: ps.position,
        stickers: normalizePackSticker(ps.stickers),
      })),
  }));
}

export const OPENED_HISTORY_PAGE_SIZE = 10;
