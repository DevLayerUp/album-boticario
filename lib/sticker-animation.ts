export type StickerAnimationType = "none" | "glow" | "holographic";

/** Resolve o efeito visual — prioriza `animation_type` do banco, com fallback por slug. */
export function resolveStickerAnimation(
  slug?: string | null,
  animationType?: string | null,
): StickerAnimationType {
  if (animationType === "glow" || animationType === "holographic") {
    return animationType;
  }
  if (slug === "super_rare") return "holographic";
  if (slug === "rare") return "glow";
  return "none";
}

/** Converte hex (#RRGGBB) em rgba para sombras animadas. */
export function rarityColorAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(13, 102, 50, ${alpha})`;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
