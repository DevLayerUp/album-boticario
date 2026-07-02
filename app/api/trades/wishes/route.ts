import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  loadTradeInventoryContextForUsers,
  listTradeableInventoryRows,
  NO_DUPLICATES_TRADE_MESSAGE,
  userHasDuplicateStickers,
} from "@/lib/trade-duplicates";

const DEFAULT_EXPLORE_LIMIT = 12;
const MAX_EXPLORE_LIMIT = 60;

/**
 * GET /api/trades/wishes?offset=0&limit=12
 * Retorna pedidos abertos de OUTROS usuários, com os stickers que cada um
 * tem disponíveis para troca (repetidas não coladas no álbum).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(
    MAX_EXPLORE_LIMIT,
    Math.max(1, Number(searchParams.get("limit")) || DEFAULT_EXPLORE_LIMIT),
  );

  const [{ data: wishes, error }, { count }] = await Promise.all([
    supabase
      .from("trade_wishes")
      .select(`
        id, created_at,
        stickers ( id, name, image_url, rarities ( name, slug, color_hex ) ),
        profiles!user_id ( id, display_name, sticker_url )
      `)
      .eq("status", "open")
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
    supabase
      .from("trade_wishes")
      .select("*", { count: "exact", head: true })
      .eq("status", "open")
      .neq("user_id", user.id),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;
  const has_more = offset + (wishes?.length ?? 0) < total;

  const ownerIds = [
    ...new Set(
      (wishes ?? [])
        .map((w) => (w.profiles as unknown as { id: string } | null)?.id)
        .filter(Boolean) as string[]
    ),
  ];

  // Repetidas disponíveis de cada dono do pedido — o ofertante escolhe qual quer em troca
  let tradeableByUser: Record<string, { sticker: unknown; quantity: number; spareQuantity: number }[]> =
    {};
  if (ownerIds.length > 0) {
    const [{ data: rows }, contexts] = await Promise.all([
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

    const rowsByUser = new Map<string, NonNullable<typeof rows>>();
    for (const row of rows ?? []) {
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
      if (tradeable.length > 0) tradeableByUser[uid] = tradeable;
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

  return NextResponse.json({ wishes: result, has_more, total });
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
