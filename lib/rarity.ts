/**
 * Cores de raridade do Design System FGB (§4 Figurinha).
 *
 * O banco guarda `rarities.color_hex`, mas a identidade visual define cores
 * próprias por raridade (borda de 5px da figurinha). Este mapa é a fonte de
 * verdade no frontend; o hex do banco é usado apenas como fallback para
 * raridades desconhecidas.
 */
export const FGB_RARITY_COLORS: Record<string, string> = {
  common: "#99d624", // verde-genz
  rare: "#00aedb", // azul-500
  super_rare: "#b57d02", // gold-700
};

export function rarityColor(
  slug?: string | null,
  fallbackHex?: string | null,
): string {
  if (slug && FGB_RARITY_COLORS[slug]) return FGB_RARITY_COLORS[slug];
  return fallbackHex ?? FGB_RARITY_COLORS.common;
}
