import { Resend } from "resend";
import {
  renderAuthEmailTemplate,
  type AuthEmailTemplateId,
} from "@/lib/email/templates";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL não configurado.");
  }
  return from;
}

export async function sendAuthEmail(options: {
  to: string;
  templateId: AuthEmailTemplateId;
  confirmationUrl: string;
  siteUrl?: string;
}): Promise<void> {
  const { subject, html } = renderAuthEmailTemplate(options.templateId, {
    confirmationUrl: options.confirmationUrl,
    siteUrl: options.siteUrl,
  });

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: options.to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Falha ao enviar e-mail transacional.");
  }
}

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}
