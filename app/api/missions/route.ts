import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildLeaderboard, RANKING_MISSION_BONUS } from "@/lib/ranking";
import { resolveMissionAction } from "@/lib/mission-actions";
import { filterVisibleMissions } from "@/lib/mission-tiers";
import { validarMissoes } from "@/lib/missions";

/**
 * GET /api/missions — active missions with user progress and summary stats.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await validarMissoes(supabase, user.id);

  const [missionsRes, userMissionsRes] = await Promise.all([
    supabase
      .from("missions")
      .select(
        `id, title, description, type, target_value, reward_packs, reward_points,
         theme, instructions, action_label, action_href, progress_unit, expires_at, sort_order,
         tier_group, tier_order, progress_baseline`,
      )
      .eq("is_active", true)
      .or("expires_at.is.null,expires_at.gt.now()")
      .order("sort_order"),
    supabase
      .from("user_missions")
      .select("mission_id, progress, completed_at, reward_claimed")
      .eq("user_id", user.id),
  ]);

  if (missionsRes.error) {
    return NextResponse.json({ error: missionsRes.error.message }, { status: 500 });
  }

  const progressByMission = new Map(
    (userMissionsRes.data ?? []).map((row) => [row.mission_id, row]),
  );

  const visibleMissions = filterVisibleMissions(
    missionsRes.data ?? [],
    (userMissionsRes.data ?? []).map((row) => ({
      mission_id: row.mission_id as number,
      reward_claimed: row.reward_claimed as boolean,
    })),
  );

  const missions = visibleMissions.map((mission) => {
    const um = progressByMission.get(mission.id);
    const action = resolveMissionAction(mission);
    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      type: mission.type,
      target_value: mission.target_value ?? 1,
      reward_packs: mission.reward_packs,
      reward_points: mission.reward_points ?? 100,
      ranking_points: RANKING_MISSION_BONUS,
      theme: mission.theme ?? "green",
      instructions: mission.instructions,
      action_label: action.label,
      action_href: action.href,
      progress_unit: mission.progress_unit,
      progress: um?.progress ?? 0,
      completed_at: um?.completed_at ?? null,
      reward_claimed: um?.reward_claimed ?? false,
    };
  });

  const completedCount = missions.filter((m) => m.completed_at).length;
  const availableCount = missions.length - completedCount;
  const packsEarned = missions
    .filter((m) => m.reward_claimed)
    .reduce((sum, m) => sum + m.reward_packs, 0);

  let rankPosition: number | null = null;
  try {
    const admin = createAdminClient();
    const leaderboard = await buildLeaderboard(admin, user.id);
    const current = leaderboard.entries.find((e) => e.user_id === user.id);
    rankPosition = current?.rank ?? null;
  } catch {
    rankPosition = null;
  }

  return NextResponse.json({
    missions,
    summary: {
      completed_count: completedCount,
      available_count: availableCount,
      packs_earned: packsEarned,
      rank_position: rankPosition,
    },
  });
}
