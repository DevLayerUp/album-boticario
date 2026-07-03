import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCampaignAudience } from "@/lib/email/campaign-audience";
import { sendCampaignEmail } from "@/lib/email/campaign-send";
import type {
  EmailCampaign,
  EmailCampaignStats,
} from "@/lib/email/campaign-types";

const BATCH_SIZE = 50;

async function getLoggedEmails(
  supabase: SupabaseClient,
  campaignId: number,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("email_campaign_logs")
    .select("email")
    .eq("campaign_id", campaignId);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.email.toLowerCase()));
}

async function updateCampaign(
  supabase: SupabaseClient,
  campaignId: number,
  updates: Partial<Pick<EmailCampaign, "status" | "sent_at" | "stats">>,
) {
  const { error } = await supabase
    .from("email_campaigns")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", campaignId);

  if (error) throw new Error(error.message);
}

async function processCampaign(
  supabase: SupabaseClient,
  campaign: EmailCampaign,
): Promise<{ sent: number; failed: number }> {
  const logged = await getLoggedEmails(supabase, campaign.id);
  const audience = await buildCampaignAudience(supabase, {
    audience: campaign.audience,
    category: campaign.category,
    audienceFilter: campaign.audience_filter,
  });

  const pending = audience.filter((r) => !logged.has(r.email.toLowerCase()));
  const stats: EmailCampaignStats = {
    total: audience.length,
    sent: campaign.stats.sent ?? 0,
    failed: campaign.stats.failed ?? 0,
    skipped: campaign.stats.skipped ?? 0,
  };

  if (campaign.status === "scheduled") {
    await updateCampaign(supabase, campaign.id, {
      status: "sending",
      stats,
    });
  }

  const batch = pending.slice(0, BATCH_SIZE);
  let batchSent = 0;
  let batchFailed = 0;

  for (const recipient of batch) {
    try {
      const result = await sendCampaignEmail({
        to: recipient.email,
        subject: campaign.title,
        htmlBody: campaign.html_body,
      });

      const { error: logError } = await supabase.from("email_campaign_logs").insert({
        campaign_id: campaign.id,
        user_id: recipient.userId,
        email: recipient.email,
        status: "sent",
        resend_id: result.id,
      });

      if (logError) throw new Error(logError.message);
      batchSent += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      await supabase.from("email_campaign_logs").insert({
        campaign_id: campaign.id,
        user_id: recipient.userId,
        email: recipient.email,
        status: "failed",
        error: message,
      });
      batchFailed += 1;
    }
  }

  stats.sent = (stats.sent ?? 0) + batchSent;
  stats.failed = (stats.failed ?? 0) + batchFailed;

  const processedCount = stats.sent + stats.failed;
  const isComplete = processedCount >= audience.length;

  await updateCampaign(supabase, campaign.id, {
    status: isComplete ? "sent" : "sending",
    sent_at: isComplete ? new Date().toISOString() : null,
    stats,
  });

  return { sent: batchSent, failed: batchFailed };
}

export async function processDueEmailCampaigns(
  supabase: SupabaseClient,
): Promise<{ processed: number; sent: number; failed: number }> {
  const now = new Date().toISOString();

  const { data: due, error: dueError } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(5);

  if (dueError) throw new Error(dueError.message);

  const { data: inProgress, error: progressError } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("status", "sending")
    .order("scheduled_at", { ascending: true })
    .limit(5);

  if (progressError) throw new Error(progressError.message);

  const campaigns = [...(due ?? []), ...(inProgress ?? [])] as EmailCampaign[];
  let totalSent = 0;
  let totalFailed = 0;

  for (const campaign of campaigns) {
    const result = await processCampaign(supabase, campaign);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { processed: campaigns.length, sent: totalSent, failed: totalFailed };
}
