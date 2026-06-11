/**
 * Server-side utility to increment mission progress for a user.
 * Call this from the relevant API routes (pack open, quiz answer, paste sticker, etc.)
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";

export async function incrementMissionProgress(
  supabase: SupabaseClient,
  userId: string,
  missionType: string,
  increment: number = 1
) {
  const { data: missions } = await supabase
    .from("missions")
    .select("id, title, target_value")
    .eq("type", missionType)
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()");

  for (const mission of missions ?? []) {
    const { data: userMission } = await supabase
      .from("user_missions")
      .select("id, progress, completed_at")
      .eq("user_id", userId)
      .eq("mission_id", mission.id)
      .maybeSingle();

    if (userMission?.completed_at) continue;

    const current    = (userMission?.progress as number) ?? 0;
    const newProgress = Math.min(current + increment, mission.target_value as number);
    const isComplete  = newProgress >= (mission.target_value as number);

    const wasComplete = !!userMission?.completed_at;

    await supabase.from("user_missions").upsert(
      {
        user_id:       userId,
        mission_id:    mission.id,
        progress:      newProgress,
        completed_at:  isComplete ? new Date().toISOString() : null,
        reward_claimed: false,
      },
      { onConflict: "user_id,mission_id" }
    );

    if (isComplete && !wasComplete) {
      await createNotification({
        userId,
        type: "mission_complete",
        title: "Conquista desbloqueada!",
        body: `Você completou: ${mission.title as string}. Resgate sua recompensa.`,
        href: "/missoes",
        dedupeKey: `mission:${mission.id}`,
        payload: { mission_id: mission.id },
      });
    }
  }
}
