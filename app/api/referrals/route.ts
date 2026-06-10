import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildInviteUrl, type ReferralSummary } from "@/lib/referrals";

function siteOrigin(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000"
  );
}

/**
 * GET /api/referrals
 * Retorna link de convite, código e total de cadastros via indicação.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: referralCode, error: codeErr } = await supabase.rpc(
    "ensure_referral_code",
    { p_user_id: user.id },
  );

  if (codeErr || !referralCode) {
    return NextResponse.json(
      { error: codeErr?.message ?? "Não foi possível gerar o código de convite." },
      { status: 500 },
    );
  }

  const [{ count }, { data: recent }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", user.id),
    supabase
      .from("profiles")
      .select("id, display_name, created_at")
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const origin = siteOrigin(request);
  const payload: ReferralSummary = {
    referral_code: referralCode,
    invite_url: buildInviteUrl(referralCode, origin),
    signup_count: count ?? 0,
    recent_signups: recent ?? [],
  };

  return NextResponse.json(payload);
}
