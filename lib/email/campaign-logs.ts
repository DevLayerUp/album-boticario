import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CampaignLogsSummary,
  CampaignTimelineBucket,
  EmailCampaignLog,
  EmailCampaignLogStatus,
  EmailCampaignStats,
} from "@/lib/email/campaign-types";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function hourBucketKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}`;
}

function hourBucketLabel(key: string): string {
  const d = new Date(`${key}:00:00`);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildLogsSummary(
  campaignStats: EmailCampaignStats,
  logCounts: { sent: number; failed: number; skipped: number },
): CampaignLogsSummary {
  const total = campaignStats.total ?? logCounts.sent + logCounts.failed + logCounts.skipped;
  const sent = logCounts.sent;
  const failed = logCounts.failed;
  const skipped = logCounts.skipped;
  const processed = sent + failed + skipped;
  const pending = Math.max(0, total - processed);
  const successRate = processed > 0 ? Math.round((sent / processed) * 100) : 0;

  return { total, sent, failed, skipped, pending, successRate };
}

export function buildLogsTimeline(
  rows: { sent_at: string; status: string }[],
): CampaignTimelineBucket[] {
  const buckets = new Map<string, { sent: number; failed: number }>();

  for (const row of rows) {
    const key = hourBucketKey(row.sent_at);
    const bucket = buckets.get(key) ?? { sent: 0, failed: 0 };
    if (row.status === "sent") bucket.sent += 1;
    else if (row.status === "failed") bucket.failed += 1;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, counts]) => ({
      key,
      label: hourBucketLabel(key),
      sent: counts.sent,
      failed: counts.failed,
    }));
}

export async function fetchCampaignLogCounts(
  supabase: SupabaseClient,
  campaignId: number,
): Promise<{ sent: number; failed: number; skipped: number }> {
  const [sentRes, failedRes, skippedRes] = await Promise.all([
    supabase
      .from("email_campaign_logs")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .eq("status", "sent"),
    supabase
      .from("email_campaign_logs")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .eq("status", "failed"),
    supabase
      .from("email_campaign_logs")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .eq("status", "skipped"),
  ]);

  if (sentRes.error) throw new Error(sentRes.error.message);
  if (failedRes.error) throw new Error(failedRes.error.message);
  if (skippedRes.error) throw new Error(skippedRes.error.message);

  return {
    sent: sentRes.count ?? 0,
    failed: failedRes.count ?? 0,
    skipped: skippedRes.count ?? 0,
  };
}

export async function fetchCampaignTimeline(
  supabase: SupabaseClient,
  campaignId: number,
): Promise<CampaignTimelineBucket[]> {
  const { data, error } = await supabase
    .from("email_campaign_logs")
    .select("sent_at, status")
    .eq("campaign_id", campaignId)
    .order("sent_at", { ascending: true });

  if (error) throw new Error(error.message);
  return buildLogsTimeline(data ?? []);
}

export async function fetchCampaignLogs(
  supabase: SupabaseClient,
  campaignId: number,
  options: {
    status?: EmailCampaignLogStatus | "all";
    page?: number;
    limit?: number;
  } = {},
): Promise<{ logs: EmailCampaignLog[]; total: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 25));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("email_campaign_logs")
    .select(
      "id, campaign_id, user_id, email, status, resend_id, error, sent_at, profiles(display_name)",
      { count: "exact" },
    )
    .eq("campaign_id", campaignId)
    .order("sent_at", { ascending: false });

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const logs: EmailCampaignLog[] = (data ?? []).map((row) => {
    const rawProfile = row.profiles as
      | { display_name: string | null }
      | { display_name: string | null }[]
      | null;
    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;
    return {
      id: row.id,
      campaign_id: row.campaign_id,
      user_id: row.user_id,
      email: row.email,
      status: row.status as EmailCampaignLogStatus,
      resend_id: row.resend_id,
      error: row.error,
      sent_at: row.sent_at,
      display_name: profile?.display_name ?? null,
    };
  });

  return { logs, total: count ?? 0 };
}
