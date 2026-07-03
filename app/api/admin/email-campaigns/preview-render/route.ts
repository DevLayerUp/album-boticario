import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { renderCampaignEmailHtml } from "@/lib/email/campaign-template";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json().catch(() => ({}));
  const title = sanitizeText(body.title, 200) || "Sem assunto";
  const htmlBody = sanitizeHtml(body.html_body);

  if (!htmlBody) {
    return NextResponse.json(
      { error: "Conteúdo do e-mail é obrigatório para o preview" },
      { status: 400 },
    );
  }

  const html = renderCampaignEmailHtml(htmlBody);

  return NextResponse.json({ html, subject: title });
}
