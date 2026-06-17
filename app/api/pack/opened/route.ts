import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  mapOpenedPackHistory,
  OPENED_HISTORY_PAGE_SIZE,
} from "@/lib/pack-opened-history";

/** GET /api/pack/opened?offset=0&limit=10 — paginated opened pack history. */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit") ?? OPENED_HISTORY_PAGE_SIZE) || OPENED_HISTORY_PAGE_SIZE),
    OPENED_HISTORY_PAGE_SIZE,
  );

  const { data, error } = await supabase
    .from("packs")
    .select(
      `id, source, opened_at,
       pack_stickers (
         position,
         stickers (id, name, image_url, rarities (name, slug, color_hex))
       )`,
    )
    .eq("user_id", user.id)
    .not("opened_at", "is", null)
    .order("opened_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(mapOpenedPackHistory(data ?? []));
}
