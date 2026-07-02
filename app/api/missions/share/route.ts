import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markSocialShareMission } from "@/lib/missions";

const VALID_SHARE_SOURCES = new Set(["sticker", "album", "native"]);

/**
 * POST /api/missions/share
 * Registra compartilhamento nas redes após ação do usuário na UI.
 * Body: { source: "sticker" | "album" | "native" }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const source = (body as { source?: string }).source;

  if (!source || !VALID_SHARE_SOURCES.has(source)) {
    return NextResponse.json({ error: "Origem de compartilhamento inválida" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("social_shared_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.social_shared_at) {
    return NextResponse.json({ success: true, already_shared: true });
  }

  await markSocialShareMission(supabase, user.id);

  return NextResponse.json({ success: true });
}
