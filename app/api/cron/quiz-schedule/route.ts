import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureQuizCoverage } from "@/lib/quiz-schedule";

/**
 * GET /api/cron/quiz-schedule
 * Fills missing quiz days for the next 60 days (Vercel Cron or manual with CRON_SECRET).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const assigned = await ensureQuizCoverage(supabase, 60);

  return NextResponse.json({ ok: true, assigned });
}
