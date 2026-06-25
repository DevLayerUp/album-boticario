import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RarityRow = {
  name: string;
  slug: string;
  color_hex: string;
};

/**
 * GET /api/trades/stickers?q=&limit=
 * Busca figurinhas ativas do catálogo (para criar pedidos de troca).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit") ?? 20) || 20));

  let query = supabase
    .from("stickers")
    .select("id, name, image_url, rarities ( name, slug, color_hex )")
    .eq("is_active", true)
    .eq("is_user_type", false)
    .order("name")
    .limit(limit);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stickers = (data ?? []).map((row) => {
    const rarities = row.rarities as RarityRow | RarityRow[] | null;
    return {
      ...row,
      rarities: Array.isArray(rarities) ? (rarities[0] ?? null) : rarities,
    };
  });

  return NextResponse.json(stickers);
}
