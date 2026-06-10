import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildLeaderboard } from "@/lib/ranking";

/**
 * GET /api/ranking
 * Leaderboard público para usuários autenticados.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const leaderboard = await buildLeaderboard(admin, user.id);
    return NextResponse.json(leaderboard);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar ranking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
