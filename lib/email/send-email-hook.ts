import { Webhook } from "standardwebhooks";
import type { AuthEmailTemplateId } from "@/lib/email/templates";

export interface SendEmailHookPayload {
  user: {
    email?: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

export function verifySendEmailHook(
  rawBody: string,
  headers: Headers,
): SendEmailHookPayload {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("SEND_EMAIL_HOOK_SECRET não configurado.");
  }

  const hookSecret = secret.replace(/^v1,whsec_/, "");
  const wh = new Webhook(hookSecret);
  const headerRecord = Object.fromEntries(headers.entries());

  return wh.verify(rawBody, headerRecord) as SendEmailHookPayload;
}

export function resolveHookTemplateId(actionType: string): AuthEmailTemplateId {
  return actionType === "recovery" ? "reset-password" : "confirm-signup";
}
