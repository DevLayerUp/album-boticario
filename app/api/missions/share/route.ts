import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markSocialShareMission } from "@/lib/missions";

/**
 * POST /api/missions/share
 * Registra o compartilhamento nas redes e valida a missão correspondente.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markSocialShareMission(supabase, user.id);

  return NextResponse.json({ success: true });
}
