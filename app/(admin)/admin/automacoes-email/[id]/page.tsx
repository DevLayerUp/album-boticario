import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CampaignDetailClient } from "./campaign-detail-client";
import {
  buildLogsSummary,
  fetchCampaignLogCounts,
  fetchCampaignLogs,
  fetchCampaignTimeline,
} from "@/lib/email/campaign-logs";
import type { EmailCampaignStats } from "@/lib/email/campaign-types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("email_campaigns")
    .select("title")
    .eq("id", Number(id))
    .maybeSingle();

  return {
    title: data?.title
      ? `Relatório — ${data.title}`
      : "Relatório de automação",
  };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const supabase = createAdminClient();

  const [{ data: campaign, error }, { data: missions }] = await Promise.all([
    supabase.from("email_campaigns").select("*").eq("id", id).single(),
    supabase
      .from("missions")
      .select("id, title, is_active")
      .order("sort_order", { ascending: true }),
  ]);

  if (error || !campaign) notFound();

  const [logCounts, timeline, { logs, total }] = await Promise.all([
    fetchCampaignLogCounts(supabase, id),
    fetchCampaignTimeline(supabase, id),
    fetchCampaignLogs(supabase, id, { page: 1, limit: 25 }),
  ]);

  const summary = buildLogsSummary(
    (campaign.stats ?? {}) as EmailCampaignStats,
    logCounts,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/automacoes-email"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gb-green"
        >
          <ArrowLeft size={14} />
          Voltar para automações
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Relatório de envios e desempenho da campanha.
        </p>
      </div>

      <CampaignDetailClient
        campaign={campaign}
        missions={missions ?? []}
        initialSummary={summary}
        initialTimeline={timeline}
        initialLogs={logs}
        initialPagination={{
          page: 1,
          limit: 25,
          total,
          totalPages: Math.max(1, Math.ceil(total / 25)),
        }}
      />
    </div>
  );
}
