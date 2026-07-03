import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processDueEmailCampaigns } from "@/lib/email/campaign-processor";
import { isResendConfigured } from "@/lib/email/campaign-send";

/**
 * GET /api/cron/email-campaigns
 * Dispara campanhas agendadas e continua envios em andamento (Vercel Cron ou manual com CRON_SECRET).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Resend não configurado" },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const result = await processDueEmailCampaigns(supabase);

  return NextResponse.json({ ok: true, ...result });
}
