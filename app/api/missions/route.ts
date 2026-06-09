import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/missions — all active missions with user's progress.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: missions, error } = await supabase
    .from("missions")
    .select(
      `id, title, description, type, target_value, reward_packs, is_active, expires_at, sort_order,
       user_missions (progress, completed_at, reward_claimed)`
    )
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten user_missions from join
  const result = (missions ?? []).map((m) => {
    const um = Array.isArray(m.user_missions) ? m.user_missions[0] : m.user_missions;
    return {
      id:            m.id,
      title:         m.title,
      description:   m.description,
      type:          m.type,
      target_value:  m.target_value,
      reward_packs:  m.reward_packs,
      expires_at:    m.expires_at,
      progress:      (um as { progress?: number } | null)?.progress ?? 0,
      completed_at:  (um as { completed_at?: string | null } | null)?.completed_at ?? null,
      reward_claimed:(um as { reward_claimed?: boolean } | null)?.reward_claimed ?? false,
    };
  });

  return NextResponse.json(result);
}
