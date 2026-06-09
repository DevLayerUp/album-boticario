/**
 * Album page layout templates.
 * Each template defines a grid (cols × rows) that auto-generates album_slots.
 */

export type TemplateId = "2x2" | "2x3" | "3x3" | "2x4" | "3x4" | "4x4";

export interface AlbumTemplate {
  id: TemplateId;
  label: string;
  cols: number;
  rows: number;
  total: number;
}

export const ALBUM_TEMPLATES: AlbumTemplate[] = [
  { id: "2x2", label: "2 × 2",  cols: 2, rows: 2, total: 4  },
  { id: "2x3", label: "2 × 3",  cols: 2, rows: 3, total: 6  },
  { id: "3x3", label: "3 × 3",  cols: 3, rows: 3, total: 9  },
  { id: "2x4", label: "2 × 4",  cols: 2, rows: 4, total: 8  },
  { id: "3x4", label: "3 × 4",  cols: 3, rows: 4, total: 12 },
  { id: "4x4", label: "4 × 4",  cols: 4, rows: 4, total: 16 },
];

export const TEMPLATE_MAP = Object.fromEntries(
  ALBUM_TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, AlbumTemplate>;

/** Returns the Tailwind grid-cols-* class for a given template id */
export function templateColsClass(templateId: string): string {
  const t = TEMPLATE_MAP[templateId as TemplateId];
  const cols = t?.cols ?? 3;
  const map: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };
  return map[cols] ?? "grid-cols-3";
}
