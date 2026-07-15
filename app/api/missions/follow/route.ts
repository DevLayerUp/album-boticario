import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markSocialFollowMission } from "@/lib/missions";

/**
 * POST /api/missions/follow
 * Registra que o usuário segue a Fundação nas redes (honor system).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("social_followed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.social_followed_at) {
    return NextResponse.json({ success: true, already_followed: true });
  }

  await markSocialFollowMission(supabase, user.id);

  return NextResponse.json({ success: true });
}
