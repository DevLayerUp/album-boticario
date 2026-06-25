import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RarityRow = {
  name: string;
  slug: string;
  color_hex: string;
  animation_type?: string;
};

/**
 * GET /api/trades/stock
 * Catálogo completo + inventário, colagem no álbum e bloqueios em negociação.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stickersRes, inventoryRes, pastedRes, wishesRes, sentRes, receivedRes, slotsRes] =
    await Promise.all([
    supabase
      .from("stickers")
      .select("id, name, image_url, rarities ( name, slug, color_hex, animation_type )")
      .eq("is_active", true)
      .eq("is_user_type", false)
      .order("name"),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", user.id)
      .gte("quantity", 1),
    supabase.from("user_album").select("sticker_id").eq("user_id", user.id),
    supabase
      .from("trade_wishes")
      .select("sticker_id")
      .eq("user_id", user.id)
      .eq("status", "open"),
    supabase
      .from("trade_requests")
      .select("offered_sticker_id, requested_sticker_id")
      .eq("requester_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("trade_requests")
      .select("offered_sticker_id, requested_sticker_id")
      .eq("receiver_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("album_slots")
      .select("id, sticker_id, album_pages ( category_id )")
      .not("sticker_id", "is", null),
  ]);

  if (stickersRes.error) {
    return NextResponse.json({ error: stickersRes.error.message }, { status: 500 });
  }

  const quantityBySticker = new Map<number, number>();
  for (const row of inventoryRes.data ?? []) {
    quantityBySticker.set(row.sticker_id, row.quantity);
  }

  const pastedStickerIds = new Set<number>();
  for (const row of pastedRes.data ?? []) {
    if (row.sticker_id != null) pastedStickerIds.add(row.sticker_id);
  }

  const openWishStickerIds = new Set<number>();
  for (const row of wishesRes.data ?? []) {
    if (row.sticker_id != null) openWishStickerIds.add(row.sticker_id);
  }

  const blockedStickerIds = new Set<number>();
  for (const trade of [...(sentRes.data ?? []), ...(receivedRes.data ?? [])]) {
    if (trade.offered_sticker_id) blockedStickerIds.add(trade.offered_sticker_id);
    if (trade.requested_sticker_id) blockedStickerIds.add(trade.requested_sticker_id);
  }

  const pasteTargetBySticker = new Map<number, { slotId: number; categoryId: number }>();
  for (const row of slotsRes.data ?? []) {
    if (row.sticker_id == null) continue;
    const page = row.album_pages as { category_id: number } | { category_id: number }[] | null;
    const categoryId = Array.isArray(page) ? page[0]?.category_id : page?.category_id;
    if (!categoryId) continue;
    if (!pasteTargetBySticker.has(row.sticker_id)) {
      pasteTargetBySticker.set(row.sticker_id, { slotId: row.id, categoryId });
    }
  }

  const items = (stickersRes.data ?? []).map((row) => {
    const rarities = row.rarities as RarityRow | RarityRow[] | null;
    const sticker = {
      ...row,
      rarities: Array.isArray(rarities) ? (rarities[0] ?? null) : rarities,
    };
    const quantity = quantityBySticker.get(row.id) ?? 0;
    return {
      sticker,
      quantity,
      isPasted: pastedStickerIds.has(row.id),
      blocked: blockedStickerIds.has(row.id),
      hasOpenWish: openWishStickerIds.has(row.id),
      pasteTarget: pasteTargetBySticker.get(row.id) ?? null,
    };
  });

  const hasTradeableDuplicates = (inventoryRes.data ?? []).some((row) => row.quantity > 1);

  return NextResponse.json({ items, hasTradeableDuplicates });
}
