/**
 * Server-side utility to create packs and generate their stickers.
 * Stickers are assigned at creation time (not at opening) — ensures integrity.
 *
 * ⚠️  Uses the admin (service-role) client internally so that RLS on
 *     pack_stickers does not block the insert (that table only has a SELECT
 *     policy for regular users, by design).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { STICKERS_PER_PACK } from "@/lib/pack-settings";

interface Rarity { id: number; slug: string; drop_percentage: number }
interface StickerRow { id: number; rarity_id: number | null }

function drawSticker(rarities: Rarity[], stickers: StickerRow[]): number {
  // No rarities configured → pure random
  if (!rarities.length) {
    return stickers[Math.floor(Math.random() * stickers.length)].id;
  }

  const rand = Math.random() * 100;
  let accumulated = 0;
  let selectedRarityId = rarities[0]?.id ?? null;

  for (const r of rarities) {
    accumulated += r.drop_percentage;
    if (rand <= accumulated) {
      selectedRarityId = r.id;
      break;
    }
  }

  // Pool of stickers with the drawn rarity
  const pool = selectedRarityId
    ? stickers.filter((s) => s.rarity_id === selectedRarityId)
    : [];

  if (pool.length === 0) {
    // Fallback: any common sticker, or any sticker at all
    const common = stickers.filter((s) => {
      const r = rarities.find((r) => r.id === s.rarity_id);
      return r?.slug === "common";
    });
    const fallback = common.length ? common : stickers;
    return fallback[Math.floor(Math.random() * fallback.length)].id;
  }

  return pool[Math.floor(Math.random() * pool.length)].id;
}

export async function createPacksForUser(
  // NOTE: the supabase param is kept for backward-compat but is no longer used
  // for writes — the function always uses the admin client to bypass RLS on
  // pack_stickers. Callers may pass null/undefined safely.
  _supabase: unknown,
  userId: string,
  source: string,
  sourceRef: string,
  quantity: number = 1
): Promise<{ success: boolean; packsCreated: number }> {
  // Always use admin client for writes so RLS on pack_stickers doesn't block.
  const admin = createAdminClient();

  // Load rarities & stickers — rarities may be empty (fine, we degrade gracefully)
  const [{ data: rarities }, { data: allStickers }] = await Promise.all([
    admin
      .from("rarities")
      .select("id, slug, drop_percentage")
      .order("drop_percentage"),
    admin
      .from("stickers")
      .select("id, rarity_id")
      .eq("is_active", true)
      .eq("is_user_type", false),
  ]);

  // If truly no stickers exist at all, bail
  if (!allStickers?.length) {
    return { success: false, packsCreated: 0 };
  }

  const rarityList = (rarities ?? []) as Rarity[];
  const stickerList = allStickers as StickerRow[];

  let packsCreated = 0;

  for (let i = 0; i < quantity; i++) {
    const { data: pack, error: packErr } = await admin
      .from("packs")
      .insert({ user_id: userId, source, source_ref: sourceRef })
      .select("id")
      .single();

    if (packErr || !pack) continue;

    const packStickers = Array.from({ length: STICKERS_PER_PACK }, (_, pos) => ({
      pack_id: pack.id,
      sticker_id: drawSticker(rarityList, stickerList),
      position: pos + 1,
    }));

    const { error: insertErr } = await admin.from("pack_stickers").insert(packStickers);
    if (insertErr) {
      await admin.from("packs").delete().eq("id", pack.id);
      continue;
    }
    packsCreated++;
  }

  return { success: packsCreated > 0, packsCreated };
}
