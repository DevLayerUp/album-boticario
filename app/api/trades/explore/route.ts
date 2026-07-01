import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getTradeableSpareForSticker,
  loadTradeInventoryContextForUsers,
  listTradeableInventoryRows,
} from "@/lib/trade-duplicates";

/**
 * GET /api/trades/explore?want_sticker_id=X
 * Returns other users who have the wanted sticker (qty >= 1),
 * along with their stickers available for trade (spare copies only).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wantId = new URL(request.url).searchParams.get("want_sticker_id");
  if (!wantId) return NextResponse.json({ error: "want_sticker_id é obrigatório" }, { status: 400 });

  // Users (other than self) who have the wanted sticker
  const { data: owners, error } = await supabase
    .from("user_stickers")
    .select(`
      quantity,
      profiles!user_id ( id, display_name, sticker_url )
    `)
    .eq("sticker_id", Number(wantId))
    .gte("quantity", 1)
    .neq("user_id", user.id)
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!owners || owners.length === 0) return NextResponse.json([]);

  const ownerIds = owners.map((o) => {
    const p = o.profiles as unknown as { id: string } | null;
    return p?.id;
  }).filter(Boolean) as string[];

  const [{ data: tradeableRows }, contexts] = await Promise.all([
    supabase
      .from("user_stickers")
      .select(`
        user_id, sticker_id, quantity,
        stickers ( id, name, image_url, rarities ( name, slug, color_hex ) )
      `)
      .in("user_id", ownerIds)
      .gte("quantity", 1),
    loadTradeInventoryContextForUsers(supabase, ownerIds),
  ]);

  const tradeableByUser = new Map<string, ReturnType<typeof listTradeableInventoryRows>>();
  const rowsByUser = new Map<string, NonNullable<typeof tradeableRows>>();

  for (const row of tradeableRows ?? []) {
    const uid = row.user_id as string;
    if (!rowsByUser.has(uid)) rowsByUser.set(uid, []);
    rowsByUser.get(uid)!.push(row);
  }

  for (const [uid, userRows] of rowsByUser) {
    const context = contexts.get(uid);
    if (!context) continue;
    const tradeable = listTradeableInventoryRows(
      userRows.map((row) => ({
        sticker_id: row.sticker_id,
        quantity: row.quantity,
        stickers: row.stickers,
      })),
      context,
    );
    if (tradeable.length > 0) tradeableByUser.set(uid, tradeable);
  }

  const result = owners
    .map((o) => {
      const profile = o.profiles as unknown as {
        id: string;
        display_name: string;
        sticker_url: string | null;
      } | null;
      const uid = profile?.id ?? "";
      const context = contexts.get(uid);
      const spareQuantity =
        context != null ? getTradeableSpareForSticker(Number(wantId), context) : 0;

      return {
        user: profile,
        has_quantity: o.quantity,
        spare_quantity: spareQuantity,
        tradeable_stickers: (tradeableByUser.get(uid) ?? []).map((r) => ({
          sticker: r.sticker,
          quantity: r.quantity,
          spareQuantity: r.spareQuantity,
        })),
      };
    })
    .filter((r) => r.user !== null && r.spare_quantity > 0);

  return NextResponse.json(result);
}
