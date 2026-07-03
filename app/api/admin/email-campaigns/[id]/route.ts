import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeId, sanitizeText } from "@/lib/sanitize";
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

type Params = { params: Promise<{ id: string }> };

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

const EDITABLE_STATUSES = new Set(["draft", "scheduled"]);

export async function GET(_request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: existing, error: fetchError } = await supabase
    .from("email_campaigns")
    .select("status, scheduled_at, audience, audience_filter")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!EDITABLE_STATUSES.has(existing.status)) {
    return NextResponse.json(
      { error: "Campanhas em envio ou finalizadas não podem ser editadas" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    const title = sanitizeText(body.title, 200);
    if (!title) return NextResponse.json({ error: "Título inválido" }, { status: 400 });
    updates.title = title;
  }
  if (body.category !== undefined) {
    const category = parseCategory(body.category);
    if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    updates.category = category;
  }
  if (body.audience !== undefined) {
    const audience = parseAudience(body.audience);
    if (!audience) return NextResponse.json({ error: "Base inválida" }, { status: 400 });
    updates.audience = audience;
  }
  if (body.audience_filter !== undefined) {
    updates.audience_filter = parseAudienceFilter(body.audience_filter);
  }
  if (body.html_body !== undefined) {
    const htmlBody = sanitizeHtml(body.html_body);
    if (!htmlBody) return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });
    updates.html_body = htmlBody;
  }
  if (body.scheduled_at !== undefined) {
    const scheduledAt = parseScheduledAt(body.scheduled_at);
    if (!scheduledAt) {
      return NextResponse.json({ error: "Data de envio inválida" }, { status: 400 });
    }
    updates.scheduled_at = scheduledAt;
  }
  if (body.status !== undefined) {
    const status = parseStatus(body.status);
    if (!status) return NextResponse.json({ error: "Status inválido" }, { status: 400 });

    if (status === "scheduled") {
      const scheduledAt =
        (updates.scheduled_at as string | undefined) ?? existing.scheduled_at;
      if (!scheduledAt || new Date(scheduledAt).getTime() < Date.now() + 5 * 60 * 1000) {
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

    updates.status = status;
  }

  const nextAudience = (updates.audience as EmailCampaignAudience | undefined) ?? existing.audience;
  const nextFilter = parseAudienceFilter(
    updates.audience_filter ?? existing.audience_filter,
  );
  const audienceError = validateCampaignAudience(nextAudience, nextFilter);
  if (audienceError) {
    return NextResponse.json({ error: audienceError }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("email_campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: existing, error: fetchError } = await supabase
    .from("email_campaigns")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (existing.status === "sending") {
    return NextResponse.json(
      { error: "Não é possível excluir campanha em envio. Cancele primeiro." },
      { status: 400 },
    );
  }

  if (existing.status === "scheduled") {
    const { data, error } = await supabase
      .from("email_campaigns")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
