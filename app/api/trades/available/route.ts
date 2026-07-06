import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  loadPendingTradeCommitmentsForUsers,
  loadUserTradeInventoryContext,
  listTradeableInventoryRows,
} from "@/lib/trade-duplicates";

/**
 * GET /api/trades/available
 * Returns the current user's stickers with spare copies available for trade.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data, error }, context, pendingMap] = await Promise.all([
    supabase
      .from("user_stickers")
      .select(`
        sticker_id, quantity,
        stickers (
          id, name, image_url,
          rarities ( name, slug, color_hex, animation_type )
        )
      `)
      .eq("user_id", user.id)
      .gte("quantity", 1)
      .order("quantity", { ascending: false }),
    loadUserTradeInventoryContext(supabase, user.id),
    loadPendingTradeCommitmentsForUsers(supabase, [user.id]),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pending = pendingMap.get(user.id);
  const tradeable = listTradeableInventoryRows(
    (data ?? []).map((row) => ({
      sticker_id: row.sticker_id,
      quantity: row.quantity,
      stickers: row.stickers,
    })),
    context,
    pending,
  );

  return NextResponse.json(
    tradeable.map((row) => ({
      sticker: row.sticker,
      quantity: row.quantity,
      spareQuantity: row.spareQuantity,
      tradeable: row.spareQuantity,
    })),
  );
}
