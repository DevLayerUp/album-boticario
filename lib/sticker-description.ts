/** Max length for sticker back description (fits the flip-card verso layout). */
export const STICKER_DESCRIPTION_MAX_LENGTH = 320;

export function validateStickerDescription(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length > STICKER_DESCRIPTION_MAX_LENGTH) {
    return `A descrição deve ter no máximo ${STICKER_DESCRIPTION_MAX_LENGTH} caracteres`;
  }
  return null;
}

export function normalizeStickerDescription(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  return trimmed.slice(0, STICKER_DESCRIPTION_MAX_LENGTH);
}
