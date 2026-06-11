/**
 * Cores de raridade do Design System FGB (§4 Figurinha — Figma 18:816).
 *
 * O banco guarda `rarities.color_hex`, mas a identidade visual define cores
 * próprias por raridade (borda, verso, tag e badge). Este mapa é a fonte de
 * verdade no frontend; o hex do banco é usado apenas como fallback para
 * raridades desconhecidas.
 */
export const FGB_RARITY_COLORS: Record<string, string> = {
  common: "#99d624", // verde-genz
  rare: "#00aedb", // azul-500
  super_rare: "#b57d02", // gold-700
};

export interface RarityBadgeStyle {
  kind: "solid" | "gradient";
  background?: string;
  gradientFrom?: string;
  gradientTo?: string;
  text: string;
  shadow?: string;
}

export interface RarityTheme {
  border: string;
  backBg: string;
  nameTag: string;
  badge: RarityBadgeStyle;
}

/** Tema completo por raridade — frente, verso e badge (Figma 26:1225 / 26:1276 / 26:1290). */
export const FGB_RARITY_THEMES: Record<string, RarityTheme> = {
  common: {
    border: "#99d624",
    backBg: "#1d501f",
    nameTag: "#42a52a",
    badge: {
      kind: "solid",
      background: "#42a52a",
      text: "#d9edd4",
    },
  },
  rare: {
    border: "#00aedb",
    backBg: "#09357a",
    nameTag: "#00aedb",
    badge: {
      kind: "gradient",
      gradientFrom: "#33bee2",
      gradientTo: "#99dff1",
      text: "#09357a",
      shadow: "0 0 5px #cceff8",
    },
  },
  super_rare: {
    border: "#b57d02",
    backBg: "#71410a",
    nameTag: "#b57d02",
    badge: {
      kind: "gradient",
      gradientFrom: "#deaa00",
      gradientTo: "#ffe07a",
      text: "#71410a",
      shadow: "0 0 10px #e3b316",
    },
  },
};

export function rarityColor(
  slug?: string | null,
  fallbackHex?: string | null,
): string {
  if (slug && FGB_RARITY_COLORS[slug]) return FGB_RARITY_COLORS[slug];
  return fallbackHex ?? FGB_RARITY_COLORS.common;
}

export function rarityTheme(
  slug?: string | null,
  fallbackHex?: string | null,
): RarityTheme {
  if (slug && FGB_RARITY_THEMES[slug]) return FGB_RARITY_THEMES[slug];
  const border = fallbackHex ?? FGB_RARITY_COLORS.common;
  return { ...FGB_RARITY_THEMES.common, border };
}
