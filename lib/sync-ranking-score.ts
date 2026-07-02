import type { SupabaseClient } from "@supabase/supabase-js";
import { countRankingEligibleMissionsForUser } from "@/lib/missions";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeRankingBreakdown,
  type RankingScoreBreakdown,
  type RankingScoreInput,
} from "@/lib/ranking";

export async function loadRankingScoreInput(
  supabase: SupabaseClient,
  userId: string,
): Promise<RankingScoreInput> {
  const [slotsRes, albumRes, packsRes, tradesRes, missions_completed] =
    await Promise.all([
      supabase.from("album_slots").select("id", { count: "exact", head: true }),
      supabase.from("user_album").select("id").eq("user_id", userId),
      supabase.from("packs").select("opened_at").eq("user_id", userId),
      supabase
        .from("trade_requests")
        .select("id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
      countRankingEligibleMissionsForUser(supabase, userId),
    ]);

  const totalSlots = Math.max(slotsRes.count ?? 1, 1);
  const filled_slots = albumRes.data?.length ?? 0;
  const album_pct = Math.round((filled_slots / totalSlots) * 100);
  const packs_opened =
    packsRes.data?.filter((pack) => pack.opened_at != null).length ?? 0;
  const trades_accepted = tradesRes.data?.length ?? 0;

  return {
    filled_slots,
    album_pct,
    packs_opened,
    missions_completed,
    trades_accepted,
  };
}

export async function syncUserRankingScore(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ score: number; breakdown: RankingScoreBreakdown }> {
  const input = await loadRankingScoreInput(supabase, userId);
  const breakdown = computeRankingBreakdown(input);
  const now = new Date().toISOString();

  const { data: current, error: readError } = await supabase
    .from("profiles")
    .select("ranking_score, ranking_score_updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (readError) throw new Error(readError.message);

  if (
    current?.ranking_score === breakdown.score &&
    current?.ranking_score_updated_at
  ) {
    return { score: breakdown.score, breakdown };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ranking_score: breakdown.score,
      ranking_score_updated_at: now,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  return { score: breakdown.score, breakdown };
}

/** Garante pontuação inicial gravada para usuários ainda não sincronizados. */
export async function ensureUserRankingScore(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("ranking_score_updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data?.ranking_score_updated_at) return;

  await syncUserRankingScore(admin, userId);
}

export async function syncUserRankingScoreById(userId: string): Promise<void> {
  const admin = createAdminClient();
  await syncUserRankingScore(admin, userId);
}

export async function syncUserRankingScores(userIds: string[]): Promise<void> {
  const admin = createAdminClient();
  const unique = [...new Set(userIds.filter(Boolean))];
  await Promise.all(unique.map((id) => syncUserRankingScore(admin, id)));
}

/** Backfill inicial — calcula e grava a pontuação de todos os usuários. */
export async function backfillAllRankingScores(): Promise<{ synced: number }> {
  const admin = createAdminClient();
  const { data: profiles, error } = await admin.from("profiles").select("id");

  if (error) throw new Error(error.message);

  let synced = 0;
  for (const profile of profiles ?? []) {
    await syncUserRankingScore(admin, profile.id);
    synced++;
  }

  return { synced };
}
