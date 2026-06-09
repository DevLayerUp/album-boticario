import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/trades/seekers?sticker_id=X
 *
 * Returns other users who:
 *   1. Do NOT own sticker X (or own qty = 0)
 *   2. Have at least one tradeable sticker (qty >= 2) to offer back
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

  // ── 2. Users with tradeable stickers (qty >= 2) who are NOT owners ────────
  const { data: traders, error } = await supabase
    .from("user_stickers")
    .select(`
      user_id, quantity,
      stickers ( id, name, image_url, rarities ( name, slug, color_hex ) ),
      profiles!user_id ( id, display_name, sticker_url )
    `)
    .gte("quantity", 2)
    .not("user_id", "in", `(${[...ownerIds].join(",")})`)
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── 3. Group tradeable stickers by user ───────────────────────────────────
  type ProfileRow = { id: string; display_name: string; sticker_url: string | null };
  type StickerRow = { id: number; name: string; image_url: string; rarities: unknown };

  const byUser = new Map<string, {
    profile: ProfileRow;
    tradeable: { sticker: StickerRow; quantity: number }[];
  }>();

  for (const row of traders ?? []) {
    const uid = row.user_id as string;
    const profile = row.profiles as unknown as ProfileRow | null;
    if (!profile) continue;

    if (!byUser.has(uid)) {
      byUser.set(uid, { profile, tradeable: [] });
    }
    byUser.get(uid)!.tradeable.push({
      sticker: row.stickers as unknown as StickerRow,
      quantity: row.quantity,
    });
  }

  const result = [...byUser.values()].map(({ profile, tradeable }) => ({
    user: profile,
    tradeable_stickers: tradeable,
  }));

  return NextResponse.json(result);
}
