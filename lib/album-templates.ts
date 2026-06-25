/**
 * Album page layout templates.
 *
 * Templates:
 *   title3  → title + rich-text paragraph + optional image + 3 sticker slots
 *   grid6   → 6 sticker slots (2 × 3) + title + rich-text paragraph below
 *   tri3    → 3 sticker slots in a V layout (1 left + 2 stacked right), larger cards
 *   3x3     → 9 sticker slots in a 3 × 3 grid
 *   profile → single centered slot filled with the user's photo sticker (profiles.sticker_url)
 *
 * Layout content is stored as JSON in the `content` DB column for sticker pages.
 * Info pages continue to use `content` as raw HTML.
 */

// ─── Template registry ────────────────────────────────────────────────────────

export type TemplateId = "title3" | "grid6" | "tri3" | "3x3" | "profile";

export interface AlbumTemplate {
  id: TemplateId;
  label: string;
  cols: number;
  rows: number;
  total: number;
}

export const ALBUM_TEMPLATES: AlbumTemplate[] = [
  { id: "title3",  label: "Título + 3",      cols: 3, rows: 1, total: 3 },
  { id: "grid6",   label: "6 + Texto",       cols: 3, rows: 2, total: 6 },
  { id: "tri3",    label: "3 em V",          cols: 2, rows: 2, total: 3 },
  { id: "3x3",     label: "3 × 3",           cols: 3, rows: 3, total: 9 },
  { id: "profile", label: "Minha Figurinha", cols: 1, rows: 1, total: 0 },
];

export const TEMPLATE_MAP = Object.fromEntries(
  ALBUM_TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, AlbumTemplate>;

/** Dimensões Figma dos cards em grids do álbum (node 360:147 / slot 28:1120). */
export const ALBUM_GRID_CARD = {
  width: 160,
  height: 229,
  borderRadius: 8,
  borderWidth: 5,
  gapX: 20,
  gapY: 24,
} as const;

/** @deprecated Use ALBUM_GRID_CARD */
export const ALBUM_GRID_3X3_CARD = ALBUM_GRID_CARD;

export function getAlbumGridDimensions(cols: number, rows: number) {
  const { width, height, gapX, gapY } = ALBUM_GRID_CARD;
  return {
    width: cols * width + (cols - 1) * gapX,
    height: rows * height + (rows - 1) * gapY,
    gapX,
    gapY,
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

/** Fields for the "tri3" and "3x3" templates */
export interface Grid3x3Data {
  title?: string;
}

/** Fields for the "profile" template (user photo sticker in the center) */
export interface ProfileData {
  title?: string;
}

/** Union of all possible layout data shapes */
export type LayoutData = Title3Data | Grid6Data | Grid3x3Data | ProfileData;

/** Templates with editable title + rich text in the content modal */
export function hasRichTextContent(templateId: string): boolean {
  return templateId === "title3" || templateId === "grid6";
}

/** Templates that do not use catalog sticker slots */
export function isProfileTemplate(templateId: string): boolean {
  return templateId === "profile";
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
