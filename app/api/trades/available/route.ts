import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/trades/available
 * Returns the current user's stickers with qty >= 1 (eligible to offer in a trade).
 * Users can trade any sticker they own, even their only copy.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
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
    .order("quantity", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    (data ?? []).map((row) => ({
      sticker: row.stickers,
      quantity: row.quantity,
      tradeable: row.quantity, // all copies can be offered
    }))
  );
}
