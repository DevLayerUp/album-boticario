import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { incrementMissionProgress } from "@/lib/missions";
import { createNotification } from "@/lib/notifications";
import {
  loadUserTradeInventoryContext,
  NO_TRADEABLE_SPARE_MESSAGE,
  userHasTradeableSpareInContext,
} from "@/lib/trade-duplicates";

type Params = { params: Promise<{ id: string }> };

async function upsertSticker(
  supabase: SupabaseClient,
  userId: string,
  stickerId: number,
): Promise<string | null> {
  const { data, error: fetchErr } = await supabase
    .from("user_stickers")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("sticker_id", stickerId)
    .maybeSingle();

  if (fetchErr) return fetchErr.message;

  if (data) {
    const { error } = await supabase
      .from("user_stickers")
      .update({ quantity: data.quantity + 1 })
      .eq("id", data.id);
    return error?.message ?? null;
  }

  const { error } = await supabase
    .from("user_stickers")
    .insert({ user_id: userId, sticker_id: stickerId, quantity: 1 });

  return error?.message ?? null;
}

/**
 * Troca inventário entre requester e receiver.
 * Usa service-role: o receptor autenticado não pode alterar linhas do proponente (RLS).
 */
async function executeTradeInventorySwap(
  trade: {
    requester_id: string;
    receiver_id: string;
    offered_sticker_id: number;
    requested_sticker_id: number;
  },
  requesterHas: number,
  receiverHas: number,
): Promise<string | null> {
  const admin = createAdminClient();

  const [decRequesterRes, decReceiverRes] = await Promise.all([
    admin
      .from("user_stickers")
      .update({ quantity: requesterHas - 1 })
      .eq("user_id", trade.requester_id)
      .eq("sticker_id", trade.offered_sticker_id),
    admin
      .from("user_stickers")
      .update({ quantity: receiverHas - 1 })
      .eq("user_id", trade.receiver_id)
      .eq("sticker_id", trade.requested_sticker_id),
  ]);

  if (decRequesterRes.error) return decRequesterRes.error.message;
  if (decReceiverRes.error) return decReceiverRes.error.message;

  const [delRequesterRes, delReceiverRes] = await Promise.all([
    admin
      .from("user_stickers")
      .delete()
      .eq("user_id", trade.requester_id)
      .eq("sticker_id", trade.offered_sticker_id)
      .eq("quantity", 0),
    admin
      .from("user_stickers")
      .delete()
      .eq("user_id", trade.receiver_id)
      .eq("sticker_id", trade.requested_sticker_id)
      .eq("quantity", 0),
  ]);

  if (delRequesterRes.error) return delRequesterRes.error.message;
  if (delReceiverRes.error) return delReceiverRes.error.message;

  const [grantReceiverErr, grantRequesterErr] = await Promise.all([
    upsertSticker(admin, trade.receiver_id, trade.offered_sticker_id),
    upsertSticker(admin, trade.requester_id, trade.requested_sticker_id),
  ]);

  return grantReceiverErr ?? grantRequesterErr;
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

  const swapError = await executeTradeInventorySwap(
    {
      requester_id: trade.requester_id,
      receiver_id: user.id,
      offered_sticker_id: trade.offered_sticker_id,
      requested_sticker_id: trade.requested_sticker_id,
    },
    requesterHas,
    receiverHas,
  );

  if (swapError) {
    return NextResponse.json(
      { error: "Não foi possível concluir a troca. Tente novamente." },
      { status: 500 },
    );
  }

  const { error: acceptErr } = await supabase
    .from("trade_requests")
    .update({ status: "accepted", resolved_at: new Date().toISOString() })
    .eq("id", tradeId);

  if (acceptErr) {
    return NextResponse.json({ error: acceptErr.message }, { status: 500 });
  }

  // Cancel other pending requests from the requester with the same offered sticker
  await supabase
    .from("trade_requests")
    .update({ status: "cancelled", resolved_at: new Date().toISOString() })
    .eq("requester_id", trade.requester_id)
    .eq("offered_sticker_id", trade.offered_sticker_id)
    .eq("status", "pending")
    .neq("id", tradeId);

  // Auto-fulfill any open wish from the receiver for the offered sticker
  await supabase
    .from("trade_wishes")
    .update({ status: "fulfilled" })
    .eq("user_id", trade.receiver_id)
    .eq("sticker_id", trade.offered_sticker_id)
    .eq("status", "open");

  const admin = createAdminClient();
  await Promise.all([
    incrementMissionProgress(admin, user.id, "trade_count", 1),
    incrementMissionProgress(admin, trade.requester_id, "trade_count", 1),
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
