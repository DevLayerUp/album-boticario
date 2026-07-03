import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchCampaignUsers } from "@/lib/email/campaign-user-search";

export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const supabase = createAdminClient();
    const results = await searchCampaignUsers(supabase, q);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro na busca" },
      { status: 500 },
    );
  }
}
