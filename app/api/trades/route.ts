import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeId, sanitizeUuid, sanitizeText } from "@/lib/sanitize";
import { createNotification } from "@/lib/notifications";
import { stickerTextToPlain } from "@/lib/sticker-text-format";
import {
  NO_DUPLICATES_TRADE_MESSAGE,
  NO_AVAILABLE_SPARE_MESSAGE,
  loadPendingTradeCommitmentsForUsers,
  loadUserTradeInventoryContext,
  userCanOfferNewTrade,
  userHasDuplicateStickers,
} from "@/lib/trade-duplicates";
import {
  TRADE_HISTORY_PAGE_SIZE,
  TRADE_HISTORY_STATUSES,
  isTradeHistoryStatus,
} from "@/lib/trade-history";

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
 * History: ?tab=history&offset=0&limit=20&status=accepted|rejected|cancelled
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "sent";

  if (tab === "sent") {
    const { data, error } = await supabase
      .from("trade_requests")
      .select(TRADE_SELECT)
      .eq("requester_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (tab === "received") {
    const { data, error } = await supabase
      .from("trade_requests")
      .select(TRADE_SELECT)
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (tab === "history") {
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || TRADE_HISTORY_PAGE_SIZE),
    );
    const statusParam = searchParams.get("status");
    const statuses = isTradeHistoryStatus(statusParam)
      ? [statusParam]
      : [...TRADE_HISTORY_STATUSES];

    const base = supabase
      .from("trade_requests")
      .select(TRADE_SELECT, { count: "exact" })
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .in("status", statuses);

    const { data, error, count } = await base
      .order("resolved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const total = count ?? 0;
    const loaded = data?.length ?? 0;
    return NextResponse.json({
      trades: data ?? [],
      total,
      has_more: offset + loaded < total,
    });
  }

  return NextResponse.json({ error: "tab inválido" }, { status: 400 });
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

  const [requesterContext, receiverContext, pendingMap] = await Promise.all([
    loadUserTradeInventoryContext(supabase, user.id),
    loadUserTradeInventoryContext(supabase, receiver_id),
    loadPendingTradeCommitmentsForUsers(supabase, [user.id, receiver_id]),
  ]);

  const requesterPending = pendingMap.get(user.id);
  const receiverPending = pendingMap.get(receiver_id);

  const requesterCanOffer = userCanOfferNewTrade(
    offered_sticker_id,
    requesterContext,
    requesterPending,
  );
  if (!requesterCanOffer) {
    return NextResponse.json(
      {
        error:
          (requesterPending?.bySticker.get(offered_sticker_id) ?? 0) > 0
            ? NO_AVAILABLE_SPARE_MESSAGE
            : "Você não tem repetida dessa figurinha para oferecer",
      },
      { status: 400 },
    );
  }

  const receiverCanTrade = userCanOfferNewTrade(
    requested_sticker_id,
    receiverContext,
    receiverPending,
  );
  if (!receiverCanTrade) {
    return NextResponse.json(
      {
        error:
          (receiverPending?.bySticker.get(requested_sticker_id) ?? 0) > 0
            ? "Esse usuário já tem trocas pendentes com essa figurinha"
            : "Esse usuário não tem repetida dessa figurinha para trocar",
      },
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
    href: "/trocas?section=negociacao&subtab=recebidas",
    dedupeKey: `trade_request:${trade.id}`,
    payload: { trade_id: trade.id },
  });

  return NextResponse.json({ trade_id: trade.id }, { status: 201 });
}
