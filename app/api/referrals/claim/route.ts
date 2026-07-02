import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeReferralCode } from "@/lib/referrals";
import { syncUserRankingScoreById } from "@/lib/sync-ranking-score";

/**
 * POST /api/referrals/claim
 * Body: { code?: string }
 * Atribui convite ao usuário autenticado (ex.: login Google após visitar ?ref=).
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
  const code = normalizeReferralCode(
    (body as { code?: string }).code ?? null,
  );

  if (!code) {
    return NextResponse.json({ error: "Código de convite inválido." }, { status: 400 });
  }

  const { data: claimed, error } = await supabase.rpc("claim_referral", {
    p_code: code,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (claimed) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.referred_by) {
      await syncUserRankingScoreById(profile.referred_by);
    }
  }

  return NextResponse.json({ claimed: Boolean(claimed) });
}
