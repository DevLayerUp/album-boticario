import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { countCampaignAudience } from "@/lib/email/campaign-audience";
import {
  EMAIL_CAMPAIGN_AUDIENCES,
  EMAIL_CAMPAIGN_CATEGORIES,
  parseAudienceFilter,
  type EmailCampaignAudience,
  type EmailCampaignCategory,
} from "@/lib/email/campaign-types";

function parseCategory(value: unknown): EmailCampaignCategory | null {
  return EMAIL_CAMPAIGN_CATEGORIES.includes(value as EmailCampaignCategory)
    ? (value as EmailCampaignCategory)
    : null;
}

function parseAudience(value: unknown): EmailCampaignAudience | null {
  return EMAIL_CAMPAIGN_AUDIENCES.includes(value as EmailCampaignAudience)
    ? (value as EmailCampaignAudience)
    : null;
}

export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const category = parseCategory(searchParams.get("category"));
  const audience = parseAudience(searchParams.get("audience"));
  const state = searchParams.get("state")?.trim().toUpperCase() || undefined;
  const missionIdRaw = searchParams.get("mission_id");
  const missionId = missionIdRaw ? Number(missionIdRaw) : undefined;
  const userId = searchParams.get("user_id")?.trim() || undefined;

  if (!category || !audience) {
    return NextResponse.json({ error: "category e audience são obrigatórios" }, { status: 400 });
  }

  const audienceFilter = parseAudienceFilter({
    state,
    mission_id: Number.isInteger(missionId) && missionId! > 0 ? missionId : undefined,
    user_id: userId,
  });

  const supabase = createAdminClient();

  try {
    const count = await countCampaignAudience(supabase, {
      audience,
      category,
      audienceFilter,
    });
    return NextResponse.json({ count });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao contar audiência" },
      { status: 500 },
    );
  }
}
