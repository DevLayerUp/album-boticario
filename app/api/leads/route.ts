import { NextRequest, NextResponse } from "next/server";
import {
  forwardLeadToSalesforceWebhook,
  validateSalesforceLeadPayload,
} from "@/lib/salesforce-lead";

/**
 * POST /api/leads
 * Recebe dados do formulário da landing e encaminha ao webhook Salesforce.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = validateSalesforceLeadPayload(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await forwardLeadToSalesforceWebhook(parsed.data);

  if (!result.ok) {
    console.error("[leads] webhook error:", result.error);
    return NextResponse.json(
      { error: "Não foi possível registrar o lead no momento." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
