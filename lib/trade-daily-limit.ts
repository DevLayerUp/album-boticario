import type { SupabaseClient } from "@supabase/supabase-js";

/** Máximo de ações de troca por usuário por dia (pedidos publicados ou propostas enviadas). */
export const DAILY_TRADE_LIMIT = 5;

/** @deprecated Use DAILY_TRADE_LIMIT */
export const DAILY_TRADE_EVENT_LIMIT = DAILY_TRADE_LIMIT;

export interface TradeDailyUsage {
  limit: number;
  created: number;
  remaining: number;
}

/** @deprecated Use TradeDailyUsage */
export type TradeEventDailyUsage = TradeDailyUsage;

/** Dia civil atual em America/Sao_Paulo (YYYY-MM-DD). */
export function getTradeDaySaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/** Início do dia civil em America/Sao_Paulo, como ISO UTC (00:00 BRT = 03:00 UTC). */
export function getStartOfTradeDaySaoPauloUtc(): string {
  return `${getTradeDaySaoPaulo()}T03:00:00.000Z`;
}

async function countRowsCreatedToday(
  supabase: SupabaseClient,
  table: "trade_wishes" | "trade_requests",
  userColumn: "user_id" | "requester_id",
  userId: string,
): Promise<number> {
  const since = getStartOfTradeDaySaoPauloUtc();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(userColumn, userId)
    .gte("created_at", since);

  if (error) throw error;
  return count ?? 0;
}

function buildUsage(created: number): TradeDailyUsage {
  return {
    limit: DAILY_TRADE_LIMIT,
    created,
    remaining: Math.max(0, DAILY_TRADE_LIMIT - created),
  };
}

export async function getTradeEventDailyUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<TradeDailyUsage> {
  const created = await countRowsCreatedToday(supabase, "trade_wishes", "user_id", userId);
  return buildUsage(created);
}

export async function getTradeProposalDailyUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<TradeDailyUsage> {
  const created = await countRowsCreatedToday(
    supabase,
    "trade_requests",
    "requester_id",
    userId,
  );
  return buildUsage(created);
}

export async function assertCanCreateTradeEventToday(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: true; usage: TradeDailyUsage } | { ok: false; error: string; usage: TradeDailyUsage }> {
  const usage = await getTradeEventDailyUsage(supabase, userId);

  if (usage.remaining <= 0) {
    return {
      ok: false,
      usage,
      error: `Você já criou ${usage.limit} eventos de troca hoje. Tente novamente amanhã.`,
    };
  }

  return { ok: true, usage };
}

export async function assertCanCreateTradeProposalToday(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: true; usage: TradeDailyUsage } | { ok: false; error: string; usage: TradeDailyUsage }> {
  const usage = await getTradeProposalDailyUsage(supabase, userId);

  if (usage.remaining <= 0) {
    return {
      ok: false,
      usage,
      error: `Você já enviou ${usage.limit} propostas de troca hoje. Tente novamente amanhã.`,
    };
  }

  return { ok: true, usage };
}
