import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { incrementMissionProgress } from "@/lib/missions";
import { createNotification } from "@/lib/notifications";
import {
  loadUserTradeInventoryContext,
  NO_TRADEABLE_SPARE_MESSAGE,
  userHasTradeableSpareInContext,
} from "@/lib/trade-duplicates";

type Params = { params: Promise<{ id: string }> };

// Helper: upsert a sticker in user inventory
async function upsertSticker(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  stickerId: number
) {
  const { data } = await supabase
    .from("user_stickers")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("sticker_id", stickerId)
    .maybeSingle();

  if (data) {
    await supabase
      .from("user_stickers")
      .update({ quantity: data.quantity + 1 })
      .eq("id", data.id);
  } else {
    await supabase
      .from("user_stickers")
      .insert({ user_id: userId, sticker_id: stickerId, quantity: 1 });
  }
}

/**
 * POST /api/trades/[id]/accept   → accept trade (receiver only)
 * POST /api/trades/[id]/reject   → reject trade (receiver only)
 * DELETE /api/trades/[id]        → cancel trade (requester only)
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const tradeId = Number(id);

  if (!Number.isInteger(tradeId) || tradeId <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const action = new URL(request.url).searchParams.get("action"); // "accept" | "reject"

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the trade
  const { data: trade, error: fetchErr } = await supabase
    .from("trade_requests")
    .select("*")
    .eq("id", tradeId)
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchErr || !trade) {
    return NextResponse.json({ error: "Troca não encontrada ou você não é o receptor" }, { status: 404 });
  }

  if (action === "reject") {
    await supabase
      .from("trade_requests")
      .update({ status: "rejected", resolved_at: new Date().toISOString() })
      .eq("id", tradeId);

    await createNotification({
      userId: trade.requester_id,
      type: "trade_rejected",
      title: "Troca recusada",
      body: "Sua solicitação de troca foi recusada.",
      href: "/trocas",
      dedupeKey: `trade_rejected:${tradeId}`,
      payload: { trade_id: tradeId },
    });

    return NextResponse.json({ success: true, status: "rejected" });
  }

  // ── ACCEPT ──────────────────────────────────────────────────────────────────
  const [requesterContext, receiverContext] = await Promise.all([
    loadUserTradeInventoryContext(supabase, trade.requester_id),
    loadUserTradeInventoryContext(supabase, user.id),
  ]);

  const requesterCanOffer = userHasTradeableSpareInContext(
    trade.offered_sticker_id,
    requesterContext,
  );
  const receiverCanTrade = userHasTradeableSpareInContext(
    trade.requested_sticker_id,
    receiverContext,
  );

  if (!requesterCanOffer) {
    await supabase
      .from("trade_requests")
      .update({ status: "cancelled", resolved_at: new Date().toISOString() })
      .eq("id", tradeId);
    return NextResponse.json(
      { error: "O proponente não tem mais repetida da figurinha oferecida" },
      { status: 409 },
    );
  }

  if (!receiverCanTrade) {
    await supabase
      .from("trade_requests")
      .update({ status: "cancelled", resolved_at: new Date().toISOString() })
      .eq("id", tradeId);
    return NextResponse.json(
      { error: NO_TRADEABLE_SPARE_MESSAGE },
      { status: 409 },
    );
  }

  const requesterHas = requesterContext.quantityBySticker.get(trade.offered_sticker_id) ?? 0;
  const receiverHas = receiverContext.quantityBySticker.get(trade.requested_sticker_id) ?? 0;

  // Execute the swap
  await Promise.all([
    // Decrement offered from requester
    supabase
      .from("user_stickers")
      .update({ quantity: requesterHas - 1 })
      .eq("user_id", trade.requester_id)
      .eq("sticker_id", trade.offered_sticker_id),
    // Decrement requested from receiver (self)
    supabase
      .from("user_stickers")
      .update({ quantity: receiverHas - 1 })
      .eq("user_id", user.id)
      .eq("sticker_id", trade.requested_sticker_id),
  ]);

  // Remove rows if quantity dropped to 0
  await Promise.all([
    supabase
      .from("user_stickers")
      .delete()
      .eq("user_id", trade.requester_id)
      .eq("sticker_id", trade.offered_sticker_id)
      .eq("quantity", 0),
    supabase
      .from("user_stickers")
      .delete()
      .eq("user_id", user.id)
      .eq("sticker_id", trade.requested_sticker_id)
      .eq("quantity", 0),
  ]);

  // Add received stickers
  await Promise.all([
    upsertSticker(supabase, user.id, trade.offered_sticker_id),
    upsertSticker(supabase, trade.requester_id, trade.requested_sticker_id),
  ]);

  // Mark as accepted
  await supabase
    .from("trade_requests")
    .update({ status: "accepted", resolved_at: new Date().toISOString() })
    .eq("id", tradeId);

  // Cancel other pending requests from the requester with the same offered sticker
  await supabase
    .from("trade_requests")
    .update({ status: "cancelled", resolved_at: new Date().toISOString() })
    .eq("requester_id", trade.requester_id)
    .eq("offered_sticker_id", trade.offered_sticker_id)
    .eq("status", "pending")
    .neq("id", tradeId);

  // Auto-fulfill any open wish from the receiver for the offered sticker
  // (receiver just received the sticker they were wishing for)
  await supabase
    .from("trade_wishes")
    .update({ status: "fulfilled" })
    .eq("user_id", trade.receiver_id)
    .eq("sticker_id", trade.offered_sticker_id)
    .eq("status", "open");

  // Increment mission progress for both
  await Promise.all([
    incrementMissionProgress(supabase, user.id, "trade_count", 1),
    incrementMissionProgress(supabase, trade.requester_id, "trade_count", 1),
  ]);

  await createNotification({
    userId: trade.requester_id,
    type: "trade_accepted",
    title: "Troca aceita!",
    body: "Sua solicitação de troca foi aceita. As figurinhas já foram trocadas.",
    href: "/trocas",
    dedupeKey: `trade_accepted:${tradeId}`,
    payload: { trade_id: tradeId },
  });

  return NextResponse.json({ success: true, status: "accepted" });
}

/**
 * DELETE /api/trades/[id]
 * Cancel a pending trade (requester only).
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const tradeIdDel = Number(id);

  if (!Number.isInteger(tradeIdDel) || tradeIdDel <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("trade_requests")
    .update({ status: "cancelled", resolved_at: new Date().toISOString() })
    .eq("id", tradeIdDel)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
