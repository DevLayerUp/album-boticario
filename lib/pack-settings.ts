export const DEFAULT_PACK_IMAGE = "/images/dashboard/pacotinhos/pacotinho.png";

export interface PackVisualSettings {
  packImageUrl: string;
  openingGifUrl: string | null;
}

export function resolvePackVisualSettings(
  packImageUrl: string | null | undefined,
  openingGifUrl: string | null | undefined,
): PackVisualSettings {
  return {
    packImageUrl: packImageUrl?.trim() || DEFAULT_PACK_IMAGE,
    openingGifUrl: openingGifUrl?.trim() || null,
  };
}
