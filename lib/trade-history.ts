export const TRADE_HISTORY_PAGE_SIZE = 20;

export const TRADE_HISTORY_STATUSES = ["accepted", "rejected", "cancelled"] as const;

export type TradeHistoryStatus = (typeof TRADE_HISTORY_STATUSES)[number];

export type TradeHistoryFilter = "all" | TradeHistoryStatus;

export function isTradeHistoryStatus(value: string | null): value is TradeHistoryStatus {
  return value != null && (TRADE_HISTORY_STATUSES as readonly string[]).includes(value);
}

export type TrocasSection = "solicitar" | "negociacao" | "estoque";

export type NegociacaoSubTab = "recebidas" | "solicitadas" | "historico";

export function parseTrocasSection(value: string | undefined): TrocasSection | undefined {
  if (value === "solicitar" || value === "negociacao" || value === "estoque") {
    return value;
  }
  return undefined;
}

export function parseNegociacaoSubTab(value: string | undefined): NegociacaoSubTab | undefined {
  if (value === "recebidas" || value === "solicitadas" || value === "historico") {
    return value;
  }
  return undefined;
}
