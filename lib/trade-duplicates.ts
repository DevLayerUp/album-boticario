import type { SupabaseClient } from "@supabase/supabase-js";
import { hasTradeableSpare, tradeableSpareCount } from "@/lib/sticker-inventory";
import { collectPastedStickerIds } from "@/lib/user-album-pasted";

export const NO_DUPLICATES_TRADE_MESSAGE =
  "Você precisa de figurinhas repetidas para trocar. Abra pacotinhos ou complete missões para conseguir mais cópias.";

async function loadPackAcquiredBySticker(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<number, number>> {
  const { data: packs } = await supabase
    .from("packs")
    .select("id")
    .eq("user_id", userId)
    .not("opened_at", "is", null);

  const packIds = (packs ?? []).map((row) => row.id);
  const acquired = new Map<number, number>();
  if (packIds.length === 0) return acquired;

  const { data: rows } = await supabase
    .from("pack_stickers")
    .select("sticker_id")
    .in("pack_id", packIds);

  for (const row of rows ?? []) {
    if (row.sticker_id == null) continue;
    acquired.set(row.sticker_id, (acquired.get(row.sticker_id) ?? 0) + 1);
  }

  return acquired;
}

export async function userHasDuplicateStickers(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const [{ data: inventory, error }, { data: pasted }] = await Promise.all([
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", userId)
      .gte("quantity", 1),
    supabase
      .from("user_album")
      .select("sticker_id, album_slots ( sticker_id )")
      .eq("user_id", userId),
  ]);

  if (error) return false;

  const pastedIds = collectPastedStickerIds(pasted ?? []);
  const packAcquired = await loadPackAcquiredBySticker(supabase, userId);

  return (inventory ?? []).some((row) =>
    hasTradeableSpare(
      row.quantity,
      pastedIds.has(row.sticker_id),
      packAcquired.get(row.sticker_id) ?? 0,
    ),
  );
}

export async function countUserTradeableSpares(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ duplicateTypes: number; extraCopies: number }> {
  const [{ data: inventory }, { data: pasted }] = await Promise.all([
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", userId)
      .gte("quantity", 1),
    supabase
      .from("user_album")
      .select("sticker_id, album_slots ( sticker_id )")
      .eq("user_id", userId),
  ]);

  const pastedIds = collectPastedStickerIds(pasted ?? []);
  const packAcquired = await loadPackAcquiredBySticker(supabase, userId);

  let duplicateTypes = 0;
  let extraCopies = 0;

  for (const row of inventory ?? []) {
    const spare = tradeableSpareCount(
      row.quantity,
      pastedIds.has(row.sticker_id),
      packAcquired.get(row.sticker_id) ?? 0,
    );
    if (spare > 0) {
      duplicateTypes += 1;
      extraCopies += spare;
    }
  }

  return { duplicateTypes, extraCopies };
}
