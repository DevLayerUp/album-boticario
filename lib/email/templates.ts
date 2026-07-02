import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getSiteUrl } from "@/lib/seo-metadata";

export type AuthEmailTemplateId = "account-created" | "reset-password";

const SUBJECTS: Record<AuthEmailTemplateId, string> = {
  "account-created":
    "Boas-vindas ao time! Seu acesso ao Fandom - Fãs por Natureza está pronto 💚",
  "reset-password": "Redefinir sua senha — Fãs por Natureza",
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

export interface AuthEmailTemplateVariables {
  siteUrl?: string;
  confirmationUrl?: string;
  displayName?: string;
}

export function renderAuthEmailTemplate(
  templateId: AuthEmailTemplateId,
  variables: AuthEmailTemplateVariables,
): { subject: string; html: string } {
  const siteUrl = (variables.siteUrl ?? getSiteUrl()).replace(/\/$/, "");
  const loginUrl = `${siteUrl}/login`;
  const albumUrl = `${siteUrl}/album`;
  const displayName = variables.displayName?.trim()
    ? `, ${variables.displayName.trim()}`
    : "";

  let html = loadTemplate(templateId)
    .replace(/\{\{\s*\.SiteURL\s*\}\}/g, siteUrl)
    .replace(/\{\{\s*\.LoginURL\s*\}\}/g, loginUrl)
    .replace(/\{\{\s*\.AlbumURL\s*\}\}/g, albumUrl)
    .replace(/\{\{\s*\.DisplayName\s*\}\}/g, displayName);

  if (variables.confirmationUrl) {
    html = html.replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, variables.confirmationUrl);
  }

  return {
    subject: SUBJECTS[templateId],
    html,
  };
}
