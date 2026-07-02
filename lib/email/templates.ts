import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getSiteUrl } from "@/lib/seo-metadata";

export type AuthEmailTemplateId = "account-created" | "reset-password";
export type FeedbackEmailTemplateId = "feedback-reply";

const SUBJECTS: Record<AuthEmailTemplateId, string> = {
  "account-created":
    "Boas-vindas ao time! Seu acesso ao Fandom - Fãs por Natureza está pronto 💚",
  "reset-password": "Redefinir sua senha — Fãs por Natureza",
};

const FEEDBACK_SUBJECTS: Record<FeedbackEmailTemplateId, string> = {
  "feedback-reply": "Resposta ao seu feedback — Fãs por Natureza",
};

const templateCache = new Map<string, string>();

function loadTemplate(id: AuthEmailTemplateId | FeedbackEmailTemplateId): string {
  const cached = templateCache.get(id);
  if (cached) return cached;

  const filePath = join(process.cwd(), "supabase", "email-templates", `${id}.html`);
  const html = readFileSync(filePath, "utf8");
  templateCache.set(id, html);
  return html;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\r\n/g, "\n").replace(/\n/g, "<br />");
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

export interface FeedbackReplyEmailVariables {
  siteUrl?: string;
  displayName?: string;
  feedbackType: string;
  replyMessage: string;
  originalMessage: string;
}

export function renderFeedbackReplyEmail(
  variables: FeedbackReplyEmailVariables,
): { subject: string; html: string } {
  const siteUrl = (variables.siteUrl ?? getSiteUrl()).replace(/\/$/, "");
  const loginUrl = `${siteUrl}/login`;
  const displayName = variables.displayName?.trim()
    ? `, ${variables.displayName.trim()}`
    : "";

  const html = loadTemplate("feedback-reply")
    .replace(/\{\{\s*\.SiteURL\s*\}\}/g, siteUrl)
    .replace(/\{\{\s*\.LoginURL\s*\}\}/g, loginUrl)
    .replace(/\{\{\s*\.DisplayName\s*\}\}/g, displayName)
    .replace(/\{\{\s*\.FeedbackType\s*\}\}/g, escapeHtml(variables.feedbackType))
    .replace(/\{\{\s*\.ReplyMessage\s*\}\}/g, formatMultilineHtml(variables.replyMessage))
    .replace(/\{\{\s*\.OriginalMessage\s*\}\}/g, formatMultilineHtml(variables.originalMessage));

  return {
    subject: FEEDBACK_SUBJECTS["feedback-reply"],
    html,
  };
}
