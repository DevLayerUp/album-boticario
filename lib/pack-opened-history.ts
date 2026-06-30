import type { SupabaseClient } from "@supabase/supabase-js";
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

const OPENED_PACK_STICKER_SELECT = `
  id, name, image_url,
  rarities ( name, slug, color_hex, animation_type )
`;

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

export function normalizePackStickerRows(rows: PackSticker[]): PackSticker[] {
  return rows.map((row) => ({
    position: row.position,
    stickers: normalizePackSticker(row.stickers),
  }));
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

/**
 * Loads opened pack history with stickers for every pack source.
 * Uses a service-role client so pack_stickers (inserted at creation/open via admin)
 * are always readable regardless of nested RLS/embed quirks.
 */
export async function fetchOpenedPackHistory(
  admin: SupabaseClient,
  userId: string,
  offset: number,
  limit: number,
): Promise<OpenedPackHistory[]> {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, limit);

  const { data: packs, error: packsError } = await admin
    .from("packs")
    .select("id, source, opened_at")
    .eq("user_id", userId)
    .not("opened_at", "is", null)
    .order("opened_at", { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (packsError || !packs?.length) return [];

  const packIds = packs.map((pack) => pack.id);

  const { data: stickerRows, error: stickersError } = await admin
    .from("pack_stickers")
    .select(`pack_id, position, stickers (${OPENED_PACK_STICKER_SELECT})`)
    .in("pack_id", packIds)
    .order("position");

  if (stickersError) {
    return mapOpenedPackHistory(packs.map((pack) => ({ ...pack, pack_stickers: [] })));
  }

  const stickersByPack = new Map<number, NonNullable<OpenedPackRow["pack_stickers"]>>();
  for (const row of stickerRows ?? []) {
    const packId = row.pack_id as number;
    const list = stickersByPack.get(packId) ?? [];
    list.push({ position: row.position as number, stickers: row.stickers });
    stickersByPack.set(packId, list);
  }

  return mapOpenedPackHistory(
    packs.map((pack) => ({
      ...pack,
      pack_stickers: stickersByPack.get(pack.id) ?? [],
    })),
  );
}
