import { NextRequest, NextResponse } from "next/server";
import {
  forwardLeadToCloudPage,
  forwardLeadToSalesforceWebhook,
  validateSalesforceLeadPayload,
} from "@/lib/salesforce-lead";

/**
 * POST /api/leads
 * Recebe os dados do formulário da landing e:
 *  1. Dispara o e-mail de boas-vindas via CloudPage do Salesforce (síncrono).
 *  2. Encaminha o lead ao webhook genérico, se configurado (best-effort).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = validateSalesforceLeadPayload(body);

  if (!parsed.ok) {
    return NextResponse.json(
      { status: "error", message: parsed.error },
      { status: 400 },
    );
  }

  const cloud = await forwardLeadToCloudPage(parsed.data);
  if (!cloud.ok) {
    console.error("[leads] cloudpage error:", cloud.error);
  }

  if (process.env.SALESFORCE_LEAD_WEBHOOK_URL?.trim()) {
    const webhook = await forwardLeadToSalesforceWebhook(parsed.data);
    if (!webhook.ok) {
      console.error("[leads] webhook error:", webhook.error);
    }
  }

  if (!cloud.ok) {
    return NextResponse.json(
      { status: "error", message: cloud.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ status: "success", message: cloud.message });
}
