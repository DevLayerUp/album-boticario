import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sanitizeId } from "@/lib/sanitize";
import { sendCampaignEmail, isResendConfigured } from "@/lib/email/campaign-send";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "Resend não configurado (RESEND_API_KEY / RESEND_FROM_EMAIL)" },
      { status: 503 },
    );
  }

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const overrideEmail =
    typeof body.email === "string" && body.email.includes("@") ? body.email.trim() : null;

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const to = overrideEmail ?? user?.email;
  if (!to) {
    return NextResponse.json({ error: "E-mail do admin não encontrado" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: campaign, error } = await supabase
    .from("email_campaigns")
    .select("title, html_body")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await sendCampaignEmail({
      to,
      subject: `[TESTE] ${campaign.title}`,
      htmlBody: campaign.html_body,
    });
    return NextResponse.json({ success: true, sent_to: to });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao enviar teste" },
      { status: 500 },
    );
  }
}
