import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCollaboratorAuthUser } from "@/lib/collaborator";
import { getUserRankPosition, RANKING_MISSION_BONUS } from "@/lib/ranking";
import { resolveMissionAction } from "@/lib/mission-actions";
import { filterVisibleMissions } from "@/lib/mission-tiers";
import {
  isMissionVisibleForUser,
  isUnlimitedMission,
  validarMissoes,
} from "@/lib/missions";

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

  const isCollaborator = isCollaboratorAuthUser(user);

  const visibleMissions = filterVisibleMissions(
    (missionsRes.data ?? []).filter((mission) =>
      isMissionVisibleForUser(mission, isCollaborator),
    ),
    (userMissionsRes.data ?? []).map((row) => ({
      mission_id: row.mission_id as number,
      reward_claimed: row.reward_claimed as boolean,
    })),
  );

  const missions = visibleMissions.map((mission) => {
    const um = progressByMission.get(mission.id);
    const action = resolveMissionAction(mission);
    const unlimited = isUnlimitedMission(mission);
    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      type: mission.type,
      target_value: unlimited ? null : (mission.target_value ?? 1),
      reward_packs: mission.reward_packs,
      reward_points: mission.reward_points ?? 100,
      ranking_points: unlimited ? 0 : RANKING_MISSION_BONUS,
      theme: mission.theme ?? "green",
      instructions: mission.instructions,
      action_label: action.label,
      action_href: action.href,
      progress_unit: mission.progress_unit,
      progress: um?.progress ?? 0,
      completed_at: unlimited ? null : (um?.completed_at ?? null),
      reward_claimed: unlimited ? false : (um?.reward_claimed ?? false),
    };
  });

  const countableMissions = missions.filter((m) => m.target_value != null);
  const completedCount = countableMissions.filter((m) => m.completed_at).length;
  const availableCount = countableMissions.length - completedCount;
  const packsEarned = missions
    .filter((m) => m.reward_claimed)
    .reduce((sum, m) => sum + m.reward_packs, 0);

  let rankPosition: number | null = null;
  try {
    const admin = createAdminClient();
    rankPosition = await getUserRankPosition(admin, user.id);
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
