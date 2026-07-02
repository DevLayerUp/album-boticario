import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { backfillAllRankingScores } from "@/lib/sync-ranking-score";

/**
 * POST /api/admin/ranking/backfill
 * Calcula e grava a pontuação atual de todos os usuários (backfill inicial).
 */
export async function POST() {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { synced } = await backfillAllRankingScores();
    return NextResponse.json({ synced });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao sincronizar pontuações";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
