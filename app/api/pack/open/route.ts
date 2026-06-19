import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { incrementMissionProgress } from "@/lib/missions";
import { checkRateLimit } from "@/lib/rate-limit";
import { STICKERS_PER_PACK } from "@/lib/pack-settings";

// Inline sticker draw for retrocompat when pack has no pack_stickers.
// Uses admin client to bypass the RLS SELECT-only policy on pack_stickers.
async function generateStickersForPack(packId: number): Promise<boolean> {
  const admin = createAdminClient();

  const [{ data: rarities }, { data: allStickers }] = await Promise.all([
    admin.from("rarities").select("id, slug, drop_percentage").order("drop_percentage"),
    admin.from("stickers").select("id, rarity_id").eq("is_active", true).eq("is_user_type", false),
  ]);

  // Need at least some stickers
  if (!allStickers?.length) return false;

  type R = { id: number; slug: string; drop_percentage: number };
  type S = { id: number; rarity_id: number | null };
  const rList = (rarities ?? []) as R[];
  const sList = allStickers as S[];

  function draw(): number {
    if (!rList.length) {
      return sList[Math.floor(Math.random() * sList.length)].id;
    }
    const rand = Math.random() * 100;
    let acc = 0;
    let rid: number | null = rList[0]?.id ?? null;
    for (const r of rList) {
      acc += r.drop_percentage;
      if (rand <= acc) { rid = r.id; break; }
    }
    const pool = rid ? sList.filter((s) => s.rarity_id === rid) : [];
    const src  = pool.length ? pool : sList;
    return src[Math.floor(Math.random() * src.length)].id;
  }

  const rows = Array.from({ length: STICKERS_PER_PACK }, (_, i) => ({
    pack_id: packId,
    sticker_id: draw(),
    position: i + 1,
  }));

  const { error } = await admin.from("pack_stickers").insert(rows);
  return !error;
}

/**
 * POST /api/pack/open
 * Opens a pack: marks it as opened, moves stickers to user_stickers inventory.
 * Body: { pack_id }
 * Returns: { stickers: [...] }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 60 aberturas por hora
  const rl = checkRateLimit(`pack-open:${user.id}`, 60, 60 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um momento." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { pack_id } = body as { pack_id?: number };
  if (!pack_id) return NextResponse.json({ error: "pack_id obrigatório" }, { status: 400 });

  // 1. Verify pack belongs to user and is still closed
  const { data: pack } = await supabase
    .from("packs")
    .select("id, opened_at, user_id")
    .eq("id", pack_id)
    .single();

  if (!pack) return NextResponse.json({ error: "Pack não encontrado" }, { status: 404 });
  if (pack.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (pack.opened_at) return NextResponse.json({ error: "Pack já aberto" }, { status: 400 });

  // 2. Check if pack has stickers; generate on-the-fly if not (admin-granted packs created before fix)
  const { count } = await supabase
    .from("pack_stickers")
    .select("id", { count: "exact", head: true })
    .eq("pack_id", pack_id);

  if (!count || count === 0) {
    await generateStickersForPack(pack_id);
  }

  // 3. Fetch the stickers in this pack (now guaranteed to exist or empty if no stickers in DB)
  const { data: packStickers, error: psErr } = await supabase
    .from("pack_stickers")
    .select(
      `position,
       stickers (
         id, name, image_url, is_user_type,
         rarities (id, name, slug, color_hex, animation_type)
       )`
    )
    .eq("pack_id", pack_id)
    .order("position");

  if (psErr) return NextResponse.json({ error: psErr.message }, { status: 500 });

  // 4. Mark pack as opened
  await supabase
    .from("packs")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", pack_id);

  // 5. Add stickers to user_stickers inventory (upsert quantity)
  for (const ps of packStickers ?? []) {
    const sticker = Array.isArray(ps.stickers) ? ps.stickers[0] : ps.stickers;
    if (!sticker) continue;
    const stickerId = (sticker as { id: number }).id;

    const { data: existing } = await supabase
      .from("user_stickers")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("sticker_id", stickerId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_stickers")
        .update({ quantity: (existing.quantity as number) + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("user_stickers")
        .insert({ user_id: user.id, sticker_id: stickerId, quantity: 1 });
    }
  }

  // 6. Increment mission progress for "open_packs"
  await incrementMissionProgress(supabase, user.id, "open_packs");

  // 7. Return stickers for animation
  return NextResponse.json({ stickers: packStickers ?? [] });
}
