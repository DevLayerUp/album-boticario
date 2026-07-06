import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { tradeableSpareCount } from "@/lib/sticker-inventory";
import {
  collectPastedStickerIds,
  type UserAlbumPastedRow,
} from "@/lib/user-album-pasted";

export const NO_DUPLICATES_TRADE_MESSAGE =
  "Você precisa de figurinhas repetidas para trocar. Abra pacotinhos ou complete missões para conseguir mais cópias.";

export const NO_TRADEABLE_SPARE_MESSAGE =
  "Só é possível trocar figurinhas repetidas que não estão reservadas no álbum.";

export const NO_AVAILABLE_SPARE_MESSAGE =
  "Não há repetidas disponíveis desta figurinha (outras trocas pendentes podem estar reservando suas cópias).";

export interface UserTradeInventoryContext {
  quantityBySticker: Map<number, number>;
  pastedStickerIds: Set<number>;
  packAcquiredBySticker: Map<number, number>;
}

/** Contagem de trocas pendentes em que o usuário deve entregar cada figurinha. */
export interface PendingTradeCommitments {
  bySticker: Map<number, number>;
}

async function loadPackAcquiredByStickerForUsers(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, Map<number, number>>> {
  const result = new Map<string, Map<number, number>>();
  for (const userId of userIds) {
    result.set(userId, new Map());
  }
  if (userIds.length === 0) return result;

  const { data: packs } = await supabase
    .from("packs")
    .select("id, user_id")
    .in("user_id", userIds)
    .not("opened_at", "is", null);

  if (!packs?.length) return result;

  const packIdToUser = new Map(packs.map((pack) => [pack.id, pack.user_id as string]));
  const { data: rows } = await supabase
    .from("pack_stickers")
    .select("pack_id, sticker_id")
    .in(
      "pack_id",
      packs.map((pack) => pack.id),
    );

  for (const row of rows ?? []) {
    const userId = packIdToUser.get(row.pack_id);
    if (!userId || row.sticker_id == null) continue;
    const acquired = result.get(userId)!;
    acquired.set(row.sticker_id, (acquired.get(row.sticker_id) ?? 0) + 1);
  }

  return result;
}

function bumpCommitment(
  map: Map<string, PendingTradeCommitments>,
  userId: string,
  stickerId: number | null | undefined,
) {
  if (!stickerId) return;
  const entry = map.get(userId);
  if (!entry) return;
  entry.bySticker.set(stickerId, (entry.bySticker.get(stickerId) ?? 0) + 1);
}

/**
 * Trocas pendentes que reservam cópias do inventário de cada usuário.
 * - Proponente: offered_sticker_id
 * - Receptor: requested_sticker_id
 */
export async function loadPendingTradeCommitmentsForUsers(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, PendingTradeCommitments>> {
  const result = new Map<string, PendingTradeCommitments>();
  for (const userId of userIds) {
    result.set(userId, { bySticker: new Map() });
  }
  if (userIds.length === 0) return result;

  const orFilter = userIds
    .flatMap((id) => [`requester_id.eq.${id}`, `receiver_id.eq.${id}`])
    .join(",");

  const { data, error } = await supabase
    .from("trade_requests")
    .select("requester_id, receiver_id, offered_sticker_id, requested_sticker_id")
    .eq("status", "pending")
    .or(orFilter);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    bumpCommitment(result, row.requester_id as string, row.offered_sticker_id);
    bumpCommitment(result, row.receiver_id as string, row.requested_sticker_id);
  }

  return result;
}

export async function loadUserTradeInventoryContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserTradeInventoryContext> {
  const contexts = await loadTradeInventoryContextForUsers(supabase, [userId]);
  return (
    contexts.get(userId) ?? {
      quantityBySticker: new Map(),
      pastedStickerIds: new Set(),
      packAcquiredBySticker: new Map(),
    }
  );
}

export async function loadTradeInventoryContextForUsers(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, UserTradeInventoryContext>> {
  const uniqueUserIds = [...new Set(userIds)];
  const contexts = new Map<string, UserTradeInventoryContext>();

  for (const userId of uniqueUserIds) {
    contexts.set(userId, {
      quantityBySticker: new Map(),
      pastedStickerIds: new Set(),
      packAcquiredBySticker: new Map(),
    });
  }

  if (uniqueUserIds.length === 0) return contexts;

  // user_album e pack_stickers são restritos por RLS ao dono — service-role para cálculo correto.
  const admin = createAdminClient();

  const [{ data: inventory }, { data: pasted }, packAcquiredByUser] =
    await Promise.all([
      supabase
        .from("user_stickers")
        .select("user_id, sticker_id, quantity")
        .in("user_id", uniqueUserIds)
        .gte("quantity", 1),
      admin
        .from("user_album")
        .select("user_id, sticker_id, album_slots ( sticker_id )")
        .in("user_id", uniqueUserIds),
      loadPackAcquiredByStickerForUsers(admin, uniqueUserIds),
    ]);

  for (const row of inventory ?? []) {
    const context = contexts.get(row.user_id as string);
    if (!context) continue;
    context.quantityBySticker.set(row.sticker_id, row.quantity);
  }

  const pastedRowsByUser = new Map<string, UserAlbumPastedRow[]>();
  for (const row of pasted ?? []) {
    const userId = row.user_id as string;
    if (!pastedRowsByUser.has(userId)) pastedRowsByUser.set(userId, []);
    pastedRowsByUser.get(userId)!.push(row);
  }

  for (const [userId, rows] of pastedRowsByUser) {
    const context = contexts.get(userId);
    if (!context) continue;
    for (const stickerId of collectPastedStickerIds(rows)) {
      context.pastedStickerIds.add(stickerId);
    }
  }

  for (const [userId, packAcquired] of packAcquiredByUser) {
    const context = contexts.get(userId);
    if (context) context.packAcquiredBySticker = packAcquired;
  }

  return contexts;
}

export function getTradeableSpareForSticker(
  stickerId: number,
  context: UserTradeInventoryContext,
): number {
  return tradeableSpareCount(
    context.quantityBySticker.get(stickerId) ?? 0,
    context.pastedStickerIds.has(stickerId),
    context.packAcquiredBySticker.get(stickerId) ?? 0,
  );
}

/** Repetidas livres após descontar trocas pendentes. */
export function getAvailableSpareForSticker(
  stickerId: number,
  context: UserTradeInventoryContext,
  pending?: PendingTradeCommitments,
): number {
  const spare = getTradeableSpareForSticker(stickerId, context);
  const reserved = pending?.bySticker.get(stickerId) ?? 0;
  return Math.max(0, spare - reserved);
}

export function userHasTradeableSpareInContext(
  stickerId: number,
  context: UserTradeInventoryContext,
): boolean {
  return getTradeableSpareForSticker(stickerId, context) > 0;
}

/** Para criar nova troca: precisa sobrar cópia após as pendentes. */
export function userCanOfferNewTrade(
  stickerId: number,
  context: UserTradeInventoryContext,
  pending?: PendingTradeCommitments,
): boolean {
  return getAvailableSpareForSticker(stickerId, context, pending) > 0;
}

/** Para aceitar troca já criada: basta ter ao menos 1 repetida real no momento. */
export function userCanFulfillPendingTrade(
  stickerId: number,
  context: UserTradeInventoryContext,
): boolean {
  return getTradeableSpareForSticker(stickerId, context) > 0;
}

export async function userHasTradeableSpareForSticker(
  supabase: SupabaseClient,
  userId: string,
  stickerId: number,
  options?: { pending?: PendingTradeCommitments; forAccept?: boolean },
): Promise<boolean> {
  const context = await loadUserTradeInventoryContext(supabase, userId);
  if (options?.forAccept) {
    return userCanFulfillPendingTrade(stickerId, context);
  }
  return userCanOfferNewTrade(stickerId, context, options?.pending);
}

export async function userHasDuplicateStickers(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const [context, pendingMap] = await Promise.all([
    loadUserTradeInventoryContext(supabase, userId),
    loadPendingTradeCommitmentsForUsers(supabase, [userId]),
  ]);
  const pending = pendingMap.get(userId);

  for (const stickerId of context.quantityBySticker.keys()) {
    if (getAvailableSpareForSticker(stickerId, context, pending) > 0) {
      return true;
    }
  }

  return false;
}

export async function countUserTradeableSpares(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ duplicateTypes: number; extraCopies: number }> {
  const [context, pendingMap] = await Promise.all([
    loadUserTradeInventoryContext(supabase, userId),
    loadPendingTradeCommitmentsForUsers(supabase, [userId]),
  ]);
  const pending = pendingMap.get(userId);

  let duplicateTypes = 0;
  let extraCopies = 0;

  for (const stickerId of context.quantityBySticker.keys()) {
    const spare = getAvailableSpareForSticker(stickerId, context, pending);
    if (spare > 0) {
      duplicateTypes += 1;
      extraCopies += spare;
    }
  }

  return { duplicateTypes, extraCopies };
}

export function listTradeableInventoryRows<TSticker>(
  rows: { sticker_id: number; quantity: number; stickers: TSticker }[],
  context: UserTradeInventoryContext,
  pending?: PendingTradeCommitments,
): { sticker: TSticker; quantity: number; spareQuantity: number }[] {
  return rows
    .map((row) => ({
      sticker: row.stickers,
      quantity: row.quantity,
      spareQuantity: getAvailableSpareForSticker(row.sticker_id, context, pending),
    }))
    .filter((row) => row.spareQuantity > 0);
}
