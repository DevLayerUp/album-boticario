import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPacksForUser } from "@/lib/pack";

/**
 * POST /api/missions/claim
 * Body: { mission_id }
 * Returns: { packs_earned }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { mission_id } = body as { mission_id?: number };
  if (!mission_id) {
    return NextResponse.json({ error: "mission_id obrigatório" }, { status: 400 });
  }

  // 1. Verify mission is complete and reward not yet claimed
  const { data: userMission } = await supabase
    .from("user_missions")
    .select("id, completed_at, reward_claimed, missions(reward_packs)")
    .eq("user_id", user.id)
    .eq("mission_id", mission_id)
    .single();

  if (!userMission?.completed_at) {
    return NextResponse.json({ error: "Missão não concluída" }, { status: 400 });
  }
  if ((userMission as { reward_claimed: boolean }).reward_claimed) {
    return NextResponse.json({ error: "Recompensa já reivindicada" }, { status: 400 });
  }

  const missionData = Array.isArray(userMission.missions)
    ? userMission.missions[0]
    : userMission.missions;
  const rewardPacks = (missionData as { reward_packs?: number } | null)?.reward_packs ?? 1;

  // 2. Create packs
  await createPacksForUser(supabase, user.id, "mission", String(mission_id), rewardPacks);

  // 3. Mark reward as claimed
  await supabase
    .from("user_missions")
    .update({ reward_claimed: true })
    .eq("id", (userMission as { id: number }).id);

  return NextResponse.json({ success: true, packs_earned: rewardPacks });
}
