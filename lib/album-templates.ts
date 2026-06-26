/**
 * Album page layout templates.
 *
 * Templates:
 *   title3  → title + rich-text paragraph + optional image + 3 sticker slots
 *   grid6   → 6 sticker slots (2 × 3) + title + rich-text paragraph below
 *   grid6cta→ 6 sticker slots (3 × 2) + CTA pill below (Figma 360:147)
 *   grid4   → 4 sticker slots in a 2 × 2 grid (Figma 339:2764)
 *   duo2    → rich text above + 2 large sticker slots side by side (Figma 334:2607)
 *   tri3    → 3 sticker slots in a V layout (1 left + 2 stacked right), larger cards
 *   3x3     → 9 sticker slots in a 3 × 3 grid
 *   profile → single centered slot filled with the user's photo sticker (profiles.sticker_url)
 *   social  → imagem orgânica + texto + ícones de redes sociais (0 slots)
 *
 * Layout content is stored as JSON in the `content` DB column for sticker pages.
 * Info pages continue to use `content` as raw HTML.
 */

// ─── Template registry ────────────────────────────────────────────────────────

export type TemplateId = "title3" | "grid6" | "grid6cta" | "grid4" | "duo2" | "tri3" | "3x3" | "profile" | "social";

export type AlbumSocialPlatform =
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "facebook";

export interface AlbumSocialLink {
  label: string;
  href: string;
  icon_url?: string;
  enabled?: boolean;
  /** Legado — não usado na renderização */
  platform?: AlbumSocialPlatform;
}

export const DEFAULT_ALBUM_SOCIAL_LINKS: AlbumSocialLink[] = [
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/fundacaogrupoboticario/",
    enabled: true,
  },
  {
    platform: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@fundacaogrupoboticario",
    enabled: true,
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/fundacaogrupoboticario/",
    enabled: true,
  },
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/user/fundacaoboticario",
    enabled: true,
  },
];

export interface AlbumTemplate {
  id: TemplateId;
  label: string;
  cols: number;
  rows: number;
  total: number;
}

export const ALBUM_TEMPLATES: AlbumTemplate[] = [
  { id: "title3",  label: "Título + 3",      cols: 3, rows: 1, total: 3 },
  { id: "grid6",    label: "6 + Texto",       cols: 3, rows: 2, total: 6 },
  { id: "grid6cta", label: "6 + CTA",         cols: 3, rows: 2, total: 6 },
  { id: "grid4",   label: "2 × 2",           cols: 2, rows: 2, total: 4 },
  { id: "duo2",    label: "2 + Texto",       cols: 2, rows: 1, total: 2 },
  { id: "tri3",    label: "3 em V",          cols: 2, rows: 2, total: 3 },
  { id: "3x3",     label: "3 × 3",           cols: 3, rows: 3, total: 9 },
  { id: "profile", label: "Minha Figurinha", cols: 1, rows: 1, total: 0 },
  { id: "social",  label: "Redes Sociais",   cols: 1, rows: 1, total: 0 },
];

export const TEMPLATE_MAP = Object.fromEntries(
  ALBUM_TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, AlbumTemplate>;

/** Cards do template duo2 — Figma 334:2607 (267×381, gap 26px). */
export const ALBUM_DUO2_CARD = {
  width: 267,
  height: 381,
  gapX: 26,
  gapY: 0,
  borderRadius: 16,
  borderWidth: 5,
} as const;

/** Layout de referência duo2 para escala no flipbook (frame 698×880). */
export const ALBUM_DUO2_DESIGN = {
  cardWidth: ALBUM_DUO2_CARD.width,
  cardHeight: ALBUM_DUO2_CARD.height,
  cardGap: ALBUM_DUO2_CARD.gapX,
  rowWidth: ALBUM_DUO2_CARD.width * 2 + ALBUM_DUO2_CARD.gapX,
  textMaxWidth: 493,
  textToCardsGap: 80,
  textFontSize: 24,
  textLineHeight: 30,
} as const;

export const ALBUM_GRID_CARD = {
  width: 160,
  height: 229,
  borderRadius: 8,
  borderWidth: 5,
  gapX: 20,
  gapY: 24,
} as const;

/** Cards do template grid6cta — Figma 360:147 (170×243, gap 25×32). */
export const ALBUM_GRID6_CTA_CARD = {
  width: 170,
  height: 243,
  gapX: 25,
  gapY: 32,
  borderRadius: 16,
  borderWidth: 5,
} as const;

/** @deprecated Use ALBUM_GRID_CARD */
export const ALBUM_GRID_3X3_CARD = ALBUM_GRID_CARD;

export function getAlbumGridDimensions(
  cols: number,
  rows: number,
  card: { width: number; height: number; gapX: number; gapY: number } = ALBUM_GRID_CARD,
) {
  return {
    width: cols * card.width + (cols - 1) * card.gapX,
    height: rows * card.height + (rows - 1) * card.gapY,
    gapX: card.gapX,
    gapY: card.gapY,
    cardW: card.width,
    cardH: card.height,
  };
}

/** Returns a Tailwind grid-cols-* class — both templates use 3 columns */
export function templateColsClass(_templateId: string): string {
  return "grid-cols-3";
}

// ─── Per-template layout data (stored as JSON in `content`) ───────────────────

/** Fields for the "title3" template */
export interface Title3Data {
  title?: string;
  text?: string;      // rich HTML paragraph
  image_url?: string;
}

/** Fields for the "grid6" template */
export interface Grid6Data {
  title?: string;
  text?: string;
}

/** Fields for the "duo2" template (Figma 334:2607) */
export interface Duo2Data {
  text?: string;
}

/** Fields for the "grid6cta" template (Figma 360:147) */
export interface Grid6CtaData {
  cta_label?: string;
  cta_href?: string;
}

/** Fields for the "grid4", "tri3" and "3x3" templates */
export interface Grid3x3Data {
  title?: string;
}

/** Fields for the "profile" template (user photo sticker in the center) */
export interface ProfileData {
  title?: string;
}

/** Fields for the "social" template (Figma 366:2500) */
export interface SocialPageData {
  title?: string;
  image_url?: string;
  text?: string;
  social_links?: AlbumSocialLink[];
}

/** Union of all possible layout data shapes */
export type LayoutData = Title3Data | Grid6Data | Grid6CtaData | Duo2Data | Grid3x3Data | ProfileData | SocialPageData;

export function hasCtaContent(templateId: string): boolean {
  return templateId === "grid6cta";
}

/** Templates with editable title + rich text in the content modal */
export function hasRichTextContent(templateId: string): boolean {
  return (
    templateId === "title3" ||
    templateId === "grid6" ||
    templateId === "duo2" ||
    templateId === "social"
  );
}

/** Templates that do not use catalog sticker slots */
export function isProfileTemplate(templateId: string): boolean {
  return templateId === "profile";
}

export function isSocialTemplate(templateId: string): boolean {
  return templateId === "social";
}

export function isSlotlessTemplate(templateId: string): boolean {
  return isProfileTemplate(templateId) || isSocialTemplate(templateId);
}

/** Parse social page JSON with defaults for links. */
export function parseSocialPageData(raw: string | null | undefined): SocialPageData {
  const parsed = parseLayoutData(raw) as SocialPageData;
  const links =
    parsed.social_links?.length && Array.isArray(parsed.social_links)
      ? parsed.social_links
      : DEFAULT_ALBUM_SOCIAL_LINKS;
  return {
    ...parsed,
    social_links: links,
  };
}

/**
 * Safely parses the `content` column value for a sticker page.
 * Returns an empty object if content is null, blank, or invalid JSON.
 */
export function parseLayoutData(raw: string | null | undefined): LayoutData {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed as LayoutData;
    return {};
  } catch {
    return {};
  }
}
