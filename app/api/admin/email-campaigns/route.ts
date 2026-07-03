import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";
import { sanitizeHtml } from "@/lib/sanitize-html";
import {
  EMAIL_CAMPAIGN_AUDIENCES,
  EMAIL_CAMPAIGN_CATEGORIES,
  EMAIL_CAMPAIGN_STATUSES,
  parseAudienceFilter,
  validateCampaignAudience,
  type EmailCampaignAudience,
  type EmailCampaignCategory,
  type EmailCampaignStatus,
} from "@/lib/email/campaign-types";
import { isResendConfigured } from "@/lib/email/campaign-send";

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

function parseStatus(value: unknown): EmailCampaignStatus | null {
  return EMAIL_CAMPAIGN_STATUSES.includes(value as EmailCampaignStatus)
    ? (value as EmailCampaignStatus)
    : null;
}

function parseScheduledAt(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json().catch(() => ({}));
  const title = sanitizeText(body.title, 200);
  const category = parseCategory(body.category);
  const audience = parseAudience(body.audience);
  const htmlBody = sanitizeHtml(body.html_body);
  const scheduledAt = parseScheduledAt(body.scheduled_at);
  const status = parseStatus(body.status) ?? "draft";
  const audienceFilter = parseAudienceFilter(body.audience_filter);

  if (!title) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  }
  if (!audience) {
    return NextResponse.json({ error: "Base de leads inválida" }, { status: 400 });
  }
  const audienceError = validateCampaignAudience(audience, audienceFilter);
  if (audienceError) {
    return NextResponse.json({ error: audienceError }, { status: 400 });
  }
  if (!htmlBody) {
    return NextResponse.json({ error: "Conteúdo HTML é obrigatório" }, { status: 400 });
  }

  if (status === "scheduled") {
    if (!scheduledAt) {
      return NextResponse.json(
        { error: "Data de envio é obrigatória para agendar" },
        { status: 400 },
      );
    }
    if (new Date(scheduledAt).getTime() < Date.now() + 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "A data de envio deve ser pelo menos 5 minutos no futuro" },
        { status: 400 },
      );
    }
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: "Resend não configurado (RESEND_API_KEY / RESEND_FROM_EMAIL)" },
        { status: 503 },
      );
    }
  }

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      title,
      category,
      audience,
      audience_filter: audienceFilter,
      html_body: htmlBody,
      scheduled_at: scheduledAt ?? new Date().toISOString(),
      status,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
