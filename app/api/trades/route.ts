import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeId, sanitizeUuid, sanitizeText } from "@/lib/sanitize";
import { createNotification } from "@/lib/notifications";
import { stickerTextToPlain } from "@/lib/sticker-text-format";
import { NO_DUPLICATES_TRADE_MESSAGE, userHasDuplicateStickers, userHasTradeableSpareForSticker } from "@/lib/trade-duplicates";

const STICKER_SELECT = `
  id, name, image_url,
  rarities ( name, slug, color_hex, animation_type )
`;

const TRADE_SELECT = `
  id, status, message, created_at, resolved_at,
  requester_id, receiver_id,
  offered_sticker:stickers!offered_sticker_id ( ${STICKER_SELECT} ),
  requested_sticker:stickers!requested_sticker_id ( ${STICKER_SELECT} ),
  requester:profiles!requester_id ( id, display_name, sticker_url ),
  receiver:profiles!receiver_id  ( id, display_name, sticker_url )
`;

/**
 * GET /api/trades?tab=sent|received|history
 * Returns trade requests for the authenticated user.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tab = new URL(request.url).searchParams.get("tab") ?? "sent";

  let query = supabase
    .from("trade_requests")
    .select(TRADE_SELECT)
    .order("created_at", { ascending: false });

  if (tab === "sent") {
    query = query.eq("requester_id", user.id).eq("status", "pending");
  } else if (tab === "received") {
    query = query.eq("receiver_id", user.id).eq("status", "pending");
  } else {
    // history: all resolved (accepted | rejected | cancelled) for this user
    query = query
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .in("status", ["accepted", "rejected", "cancelled"])
      .limit(50);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/**
 * POST /api/trades
 * Create a new trade request.
 * Body: { receiver_id, offered_sticker_id, requested_sticker_id, message? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 20 propostas por hora
  const rl = checkRateLimit(`trade:${user.id}`, 20, 60 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));

  const receiver_id       = sanitizeUuid(body.receiver_id);
  const offered_sticker_id  = sanitizeId(body.offered_sticker_id);
  const requested_sticker_id = sanitizeId(body.requested_sticker_id);
  const sanitizedMessage  = sanitizeText(body.message, 300) || null;

  if (!receiver_id || !offered_sticker_id || !requested_sticker_id) {
    return NextResponse.json(
      { error: "receiver_id, offered_sticker_id e requested_sticker_id são obrigatórios" },
      { status: 400 }
    );
  }

  if (receiver_id === user.id) {
    return NextResponse.json({ error: "Você não pode trocar consigo mesmo" }, { status: 400 });
  }

  const hasDuplicates = await userHasDuplicateStickers(supabase, user.id);
  if (!hasDuplicates) {
    return NextResponse.json({ error: NO_DUPLICATES_TRADE_MESSAGE }, { status: 403 });
  }

  // 1. Requester must have a spare copy of the offered sticker (not only pasted in album)
  const requesterCanOffer = await userHasTradeableSpareForSticker(
    supabase,
    user.id,
    offered_sticker_id,
  );
  if (!requesterCanOffer) {
    return NextResponse.json(
      { error: "Você não tem repetida dessa figurinha para oferecer" },
      { status: 400 },
    );
  }

  // 2. Receiver must have a spare copy of the requested sticker
  const receiverCanTrade = await userHasTradeableSpareForSticker(
    supabase,
    receiver_id,
    requested_sticker_id,
  );
  if (!receiverCanTrade) {
    return NextResponse.json(
      { error: "Esse usuário não tem repetida dessa figurinha para trocar" },
      { status: 400 },
    );
  }

  // 3. No duplicate pending request
  const { data: duplicate } = await supabase
    .from("trade_requests")
    .select("id")
    .eq("requester_id", user.id)
    .eq("receiver_id", receiver_id)
    .eq("offered_sticker_id", offered_sticker_id)
    .eq("requested_sticker_id", requested_sticker_id)
    .eq("status", "pending")
    .maybeSingle();

  if (duplicate) {
    return NextResponse.json({ error: "Você já enviou essa solicitação" }, { status: 409 });
  }

  // 4. Create
  const { data: trade, error: tradeErr } = await supabase
    .from("trade_requests")
    .insert({
      requester_id: user.id,
      receiver_id,
      offered_sticker_id,
      requested_sticker_id,
      message: sanitizedMessage,
    })
    .select()
    .single();

  if (tradeErr) return NextResponse.json({ error: tradeErr.message }, { status: 500 });

  const [{ data: requesterProfile }, { data: offeredSticker }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("stickers")
      .select("name")
      .eq("id", offered_sticker_id)
      .maybeSingle(),
  ]);

  await createNotification({
    userId: receiver_id,
    type: "trade_request",
    title: "Nova solicitação de troca",
    body: `${requesterProfile?.display_name ?? "Um colecionador"} quer trocar ${offeredSticker?.name ? stickerTextToPlain(offeredSticker.name) : "uma figurinha"} com você.`,
    href: "/trocas",
    dedupeKey: `trade_request:${trade.id}`,
    payload: { trade_id: trade.id },
  });

  return NextResponse.json({ trade_id: trade.id }, { status: 201 });
}
