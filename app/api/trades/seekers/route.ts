import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  loadPendingTradeCommitmentsForUsers,
  loadTradeInventoryContextForUsers,
  listTradeableInventoryRows,
} from "@/lib/trade-duplicates";

/**
 * GET /api/trades/seekers?sticker_id=X
 *
 * Returns other users who:
 *   1. Do NOT own sticker X (or own qty = 0)
 *   2. Have at least one tradeable spare sticker to offer back
 *
 * Used in "Tenho para Trocar" flow: "I have extra copies of X — who wants it?"
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stickerId = Number(new URL(request.url).searchParams.get("sticker_id"));
  if (!stickerId) return NextResponse.json({ error: "sticker_id é obrigatório" }, { status: 400 });

  // ── 1. Users who have the sticker (to EXCLUDE them) ──────────────────────
  const { data: owners } = await supabase
    .from("user_stickers")
    .select("user_id")
    .eq("sticker_id", stickerId)
    .gte("quantity", 1);

  const ownerIds = new Set((owners ?? []).map((o) => o.user_id as string));
  ownerIds.add(user.id); // exclude self

  // ── 2. Users with inventory who are NOT owners ───────────────────────────
  const { data: traders, error } = await supabase
    .from("user_stickers")
    .select(`
      user_id, sticker_id, quantity,
      stickers ( id, name, image_url, rarities ( name, slug, color_hex ) ),
      profiles!user_id ( id, display_name, sticker_url )
    `)
    .gte("quantity", 1)
    .not("user_id", "in", `(${[...ownerIds].join(",")})`)
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type ProfileRow = { id: string; display_name: string; sticker_url: string | null };
  type StickerRow = { id: number; name: string; image_url: string; rarities: unknown };

  const traderIds = [...new Set((traders ?? []).map((row) => row.user_id as string))];
  const [contexts, pendingMap] = await Promise.all([
    loadTradeInventoryContextForUsers(supabase, traderIds),
    loadPendingTradeCommitmentsForUsers(supabase, traderIds),
  ]);

  const byUser = new Map<string, {
    profile: ProfileRow;
    tradeable: { sticker: StickerRow; quantity: number; spareQuantity: number }[];
  }>();

  const rowsByUser = new Map<string, NonNullable<typeof traders>>();
  for (const row of traders ?? []) {
    const uid = row.user_id as string;
    if (!rowsByUser.has(uid)) rowsByUser.set(uid, []);
    rowsByUser.get(uid)!.push(row);
  }

  for (const [uid, userRows] of rowsByUser) {
    const profile = userRows[0]?.profiles as unknown as ProfileRow | null;
    const context = contexts.get(uid);
    const pending = pendingMap.get(uid);
    if (!profile || !context) continue;

    const tradeable = listTradeableInventoryRows(
      userRows.map((row) => ({
        sticker_id: row.sticker_id,
        quantity: row.quantity,
        stickers: row.stickers,
      })),
      context,
      pending,
    ).map((row) => ({
      sticker: row.sticker as unknown as StickerRow,
      quantity: row.quantity,
      spareQuantity: row.spareQuantity,
    }));

    if (tradeable.length > 0) {
      byUser.set(uid, { profile, tradeable });
    }
  }

  const result = [...byUser.values()].map(({ profile, tradeable }) => ({
    user: profile,
    tradeable_stickers: tradeable,
  }));

  return NextResponse.json(result);
}
