import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_SWAP_RETRIES = 3;

/**
 * Decrementa 1 unidade com lock otimista (quantity lida no momento do update).
 * Evita sobrescrever o estoque com valor stale do contexto de troca.
 */
export async function decrementUserStickerQuantity(
  admin: SupabaseClient,
  userId: string,
  stickerId: number,
): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_SWAP_RETRIES; attempt++) {
    const { data, error } = await admin
      .from("user_stickers")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("sticker_id", stickerId)
      .maybeSingle();

    if (error) return error.message;
    if (!data || data.quantity < 1) {
      return "INSUFFICIENT_QUANTITY";
    }

    const nextQuantity = data.quantity - 1;
    const { data: updated, error: updateErr } = await admin
      .from("user_stickers")
      .update({ quantity: nextQuantity })
      .eq("id", data.id)
      .eq("quantity", data.quantity)
      .select("id")
      .maybeSingle();

    if (updateErr) return updateErr.message;
    if (!updated) continue;

    if (nextQuantity === 0) {
      const { error: deleteErr } = await admin
        .from("user_stickers")
        .delete()
        .eq("id", data.id)
        .eq("quantity", 0);

      if (deleteErr) return deleteErr.message;
    }

    return null;
  }

  return "INVENTORY_CONFLICT";
}

export async function grantUserStickerQuantity(
  admin: SupabaseClient,
  userId: string,
  stickerId: number,
): Promise<string | null> {
  const { data, error: fetchErr } = await admin
    .from("user_stickers")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("sticker_id", stickerId)
    .maybeSingle();

  if (fetchErr) return fetchErr.message;

  if (data) {
    const { error } = await admin
      .from("user_stickers")
      .update({ quantity: data.quantity + 1 })
      .eq("id", data.id);
    return error?.message ?? null;
  }

  const { error } = await admin.from("user_stickers").insert({
    user_id: userId,
    sticker_id: stickerId,
    quantity: 1,
  });

  return error?.message ?? null;
}

export async function executeTradeInventorySwap(
  admin: SupabaseClient,
  trade: {
    requester_id: string;
    receiver_id: string;
    offered_sticker_id: number;
    requested_sticker_id: number;
  },
): Promise<string | null> {
  const decRequesterErr = await decrementUserStickerQuantity(
    admin,
    trade.requester_id,
    trade.offered_sticker_id,
  );
  if (decRequesterErr) return decRequesterErr;

  const decReceiverErr = await decrementUserStickerQuantity(
    admin,
    trade.receiver_id,
    trade.requested_sticker_id,
  );
  if (decReceiverErr) {
    await grantUserStickerQuantity(
      admin,
      trade.requester_id,
      trade.offered_sticker_id,
    );
    return decReceiverErr;
  }

  const grantReceiverErr = await grantUserStickerQuantity(
    admin,
    trade.receiver_id,
    trade.offered_sticker_id,
  );
  if (grantReceiverErr) {
    await Promise.all([
      grantUserStickerQuantity(admin, trade.requester_id, trade.offered_sticker_id),
      grantUserStickerQuantity(admin, trade.receiver_id, trade.requested_sticker_id),
    ]);
    return grantReceiverErr;
  }

  const grantRequesterErr = await grantUserStickerQuantity(
    admin,
    trade.requester_id,
    trade.requested_sticker_id,
  );
  if (grantRequesterErr) {
    await Promise.all([
      grantUserStickerQuantity(admin, trade.requester_id, trade.offered_sticker_id),
      grantUserStickerQuantity(admin, trade.receiver_id, trade.requested_sticker_id),
      decrementUserStickerQuantity(admin, trade.receiver_id, trade.offered_sticker_id),
    ]);
    return grantRequesterErr;
  }

  return null;
}
