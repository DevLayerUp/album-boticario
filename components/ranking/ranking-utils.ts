import type { RankingEntry } from "@/lib/ranking";

export function rankingDisplayName(entry: RankingEntry) {
  return entry.display_name || entry.username || "Colecionador";
}

export function formatRankingPoints(score: number) {
  return score.toLocaleString("pt-BR");
}

export function formatUpdatedLabel(updatedAt: Date) {
  const diffMs = Date.now() - updatedAt.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (minutes < 60) return `ATUALIZADO HÁ ${minutes}MIN`;
  const hours = Math.floor(minutes / 60);
  return `ATUALIZADO HÁ ${hours}H`;
}
