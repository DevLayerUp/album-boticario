import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimMissionReward, MissionClaimError } from "@/lib/missions";

/**
 * POST /api/missions/claim
 * Body: { mission_id }
 * Returns: { packs_earned, points_earned, mission_title }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const missionId = Number((body as { mission_id?: unknown }).mission_id);

  if (!Number.isFinite(missionId) || missionId <= 0) {
    return NextResponse.json({ error: "mission_id obrigatório" }, { status: 400 });
  }

  try {
    const result = await claimMissionReward(supabase, user.id, missionId);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof MissionClaimError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Erro ao resgatar recompensa";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
