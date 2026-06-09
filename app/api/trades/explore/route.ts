import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/trades/explore?want_sticker_id=X
 * Returns other users who have the wanted sticker (qty >= 1),
 * along with their stickers available for trade (qty >= 2).
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

  // For each owner, fetch their tradeable stickers (qty >= 2)
  const ownerIds = owners.map((o) => {
    const p = o.profiles as unknown as { id: string } | null;
    return p?.id;
  }).filter(Boolean) as string[];

  const { data: tradeableRows } = await supabase
    .from("user_stickers")
    .select(`
      user_id, quantity,
      stickers ( id, name, image_url, rarities ( name, slug, color_hex ) )
    `)
    .in("user_id", ownerIds)
    .gte("quantity", 2);

  // Group tradeable by user_id
  const tradeableByUser = new Map<string, typeof tradeableRows>();
  for (const row of tradeableRows ?? []) {
    const uid = row.user_id as string;
    if (!tradeableByUser.has(uid)) tradeableByUser.set(uid, []);
    tradeableByUser.get(uid)!.push(row);
  }

  const result = owners.map((o) => {
    const profile = o.profiles as unknown as { id: string; display_name: string; sticker_url: string | null } | null;
    const uid = profile?.id ?? "";
    return {
      user: profile,
      has_quantity: o.quantity,
      tradeable_stickers: (tradeableByUser.get(uid) ?? []).map((r) => ({
        sticker: r.stickers,
        quantity: r.quantity,
      })),
    };
  }).filter((r) => r.user !== null);

  return NextResponse.json(result);
}
