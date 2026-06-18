import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validarMissoes } from "@/lib/missions";

/**
 * POST /api/missions/validate
 * Reconcilia o progresso das missões com a atividade real do usuário.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await validarMissoes(supabase, user.id);

  return NextResponse.json({ success: true, ...result });
}
