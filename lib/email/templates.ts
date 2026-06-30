import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getSiteUrl } from "@/lib/seo-metadata";

export type AuthEmailTemplateId = "confirm-signup" | "reset-password";

const SUBJECTS: Record<AuthEmailTemplateId, string> = {
  "confirm-signup": "Confirme sua conta — Fãs da Natureza",
  "reset-password": "Redefinir sua senha — Fãs da Natureza",
};

const templateCache = new Map<AuthEmailTemplateId, string>();

function loadTemplate(id: AuthEmailTemplateId): string {
  const cached = templateCache.get(id);
  if (cached) return cached;

  const filePath = join(process.cwd(), "supabase", "email-templates", `${id}.html`);
  const html = readFileSync(filePath, "utf8");
  templateCache.set(id, html);
  return html;
}

export function mapSupabaseEmailActionType(
  actionType: string,
): AuthEmailTemplateId {
  if (actionType === "recovery") return "reset-password";
  return "confirm-signup";
}

export function renderAuthEmailTemplate(
  templateId: AuthEmailTemplateId,
  variables: { confirmationUrl: string; siteUrl?: string },
): { subject: string; html: string } {
  const siteUrl = (variables.siteUrl ?? getSiteUrl()).replace(/\/$/, "");
  const html = loadTemplate(templateId)
    .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, variables.confirmationUrl)
    .replace(/\{\{\s*\.SiteURL\s*\}\}/g, siteUrl);

  return {
    subject: SUBJECTS[templateId],
    html,
  };
}

/** URL de verificação compatível com o fluxo do Supabase Auth (signup / recovery). */
export function buildSupabaseAuthVerifyUrl(options: {
  tokenHash: string;
  emailActionType: string;
  redirectTo: string;
}): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");
  }

  const type =
    options.emailActionType === "recovery" ? "recovery" : "signup";

  const params = new URLSearchParams({
    token: options.tokenHash,
    type,
    redirect_to: options.redirectTo,
  });

  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`;
}
