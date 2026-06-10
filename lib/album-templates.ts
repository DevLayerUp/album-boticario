/**
 * Album page layout templates.
 *
 * Templates:
 *   title3  → title + rich-text paragraph + optional image + 3 sticker slots
 *   3x3     → 9 sticker slots in a 3 × 3 grid
 *
 * Layout content is stored as JSON in the `content` DB column for sticker pages.
 * Info pages continue to use `content` as raw HTML.
 */

// ─── Template registry ────────────────────────────────────────────────────────

export type TemplateId = "title3" | "3x3";

export interface AlbumTemplate {
  id: TemplateId;
  label: string;
  cols: number;
  rows: number;
  total: number;
}

export const ALBUM_TEMPLATES: AlbumTemplate[] = [
  { id: "title3", label: "Título + 3", cols: 3, rows: 1, total: 3 },
  { id: "3x3",    label: "3 × 3",      cols: 3, rows: 3, total: 9 },
];

export const TEMPLATE_MAP = Object.fromEntries(
  ALBUM_TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, AlbumTemplate>;

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

/** Fields for the "3x3" template */
export interface Grid3x3Data {
  title?: string;
}

/** Union of all possible layout data shapes */
export type LayoutData = Title3Data | Grid3x3Data;

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
