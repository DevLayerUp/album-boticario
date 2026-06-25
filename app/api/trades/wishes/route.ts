import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NO_DUPLICATES_TRADE_MESSAGE, userHasDuplicateStickers } from "@/lib/trade-duplicates";

/**
 * GET /api/trades/wishes
 * Retorna pedidos abertos de OUTROS usuários, com os stickers que cada um
 * tem disponíveis para troca (qty >= 1) — usados no modal de oferta.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: wishes, error } = await supabase
    .from("trade_wishes")
    .select(`
      id, created_at,
      stickers ( id, name, image_url, rarities ( name, slug, color_hex ) ),
      profiles!user_id ( id, display_name, sticker_url )
    `)
    .eq("status", "open")
    .neq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ownerIds = [
    ...new Set(
      (wishes ?? [])
        .map((w) => (w.profiles as unknown as { id: string } | null)?.id)
        .filter(Boolean) as string[]
    ),
  ];

  // Repetidas (qty >= 2) de cada dono do pedido — o ofertante escolhe qual quer em troca
  let tradeableByUser: Record<string, { sticker: unknown; quantity: number }[]> = {};
  if (ownerIds.length > 0) {
    const { data: rows } = await supabase
      .from("user_stickers")
      .select(`
        user_id, quantity,
        stickers ( id, name, image_url, rarities ( name, slug, color_hex ) )
      `)
      .in("user_id", ownerIds)
      .gte("quantity", 2);

    for (const row of rows ?? []) {
      const uid = row.user_id as string;
      if (!tradeableByUser[uid]) tradeableByUser[uid] = [];
      tradeableByUser[uid].push({ sticker: row.stickers, quantity: row.quantity });
    }
  }

  type ProfileRow = { id: string; display_name: string; sticker_url: string | null };

  const result = (wishes ?? []).map((w) => {
    const profile = w.profiles as unknown as ProfileRow | null;
    return {
      id: w.id,
      created_at: w.created_at,
      sticker: w.stickers,
      user: profile,
      user_stickers: tradeableByUser[profile?.id ?? ""] ?? [],
    };
  });

  return NextResponse.json(result);
}

/**
 * POST /api/trades/wishes
 * Cria um novo pedido de figurinha.
 * Body: { sticker_id }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sticker_id = Number(body.sticker_id);
  if (!sticker_id) {
    return NextResponse.json({ error: "sticker_id é obrigatório" }, { status: 400 });
  }

  const hasDuplicates = await userHasDuplicateStickers(supabase, user.id);
  if (!hasDuplicates) {
    return NextResponse.json({ error: NO_DUPLICATES_TRADE_MESSAGE }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("trade_wishes")
    .insert({ user_id: user.id, sticker_id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Você já tem um pedido aberto para esta figurinha" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ wish_id: data.id }, { status: 201 });
}
