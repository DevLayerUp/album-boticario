import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getSiteUrl } from "@/lib/seo-metadata";

let campaignTemplateCache: string | null = null;

function loadCampaignTemplate(): string {
  if (campaignTemplateCache) return campaignTemplateCache;

  const filePath = join(
    process.cwd(),
    "supabase",
    "email-templates",
    "campaign.html",
  );
  campaignTemplateCache = readFileSync(filePath, "utf8");
  return campaignTemplateCache;
}

/** Renderiza o HTML final da campanha com o layout transacional. */
export function renderCampaignEmailHtml(bodyHtml: string): string {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const preferencesUrl = `${siteUrl}/perfil`;

  return loadCampaignTemplate()
    .replace(/\{\{\s*\.SiteURL\s*\}\}/g, siteUrl)
    .replace(/\{\{\s*\.PreferencesURL\s*\}\}/g, preferencesUrl)
    .replace(/\{\{\s*\.Content\s*\}\}/g, bodyHtml);
}

/** @deprecated use renderCampaignEmailHtml */
export function wrapCampaignHtml(bodyHtml: string): string {
  return renderCampaignEmailHtml(bodyHtml);
}
