import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeId } from "@/lib/sanitize";
import {
  buildLogsSummary,
  fetchCampaignLogCounts,
  fetchCampaignLogs,
  fetchCampaignTimeline,
} from "@/lib/email/campaign-logs";
import type { EmailCampaignLogStatus, EmailCampaignStats } from "@/lib/email/campaign-types";

type Params = { params: Promise<{ id: string }> };

function parseLogStatus(value: string | null): EmailCampaignLogStatus | "all" {
  if (value === "sent" || value === "failed" || value === "skipped") return value;
  return "all";
}

export async function GET(request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const status = parseLogStatus(searchParams.get("status"));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));

  const supabase = createAdminClient();

  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("id, title, status, stats")
    .eq("id", id)
    .single();

  if (campaignError) {
    return NextResponse.json({ error: campaignError.message }, { status: 404 });
  }

  try {
    const [logCounts, timeline, { logs, total }] = await Promise.all([
      fetchCampaignLogCounts(supabase, id),
      fetchCampaignTimeline(supabase, id),
      fetchCampaignLogs(supabase, id, { status, page, limit }),
    ]);

    const summary = buildLogsSummary(
      (campaign.stats ?? {}) as EmailCampaignStats,
      logCounts,
    );

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
      },
      summary,
      timeline,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao carregar logs" },
      { status: 500 },
    );
  }
}
