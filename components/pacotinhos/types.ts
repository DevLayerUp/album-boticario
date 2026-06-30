export interface PackSticker {
  position: number;
  stickers: {
    id: number;
    name: string;
    image_url: string | null;
    rarities: {
      name: string;
      slug: string;
      color_hex: string;
      animation_type?: string;
    } | null;
  } | null;
}

export interface Pack {
  id: number;
  source: string;
  source_ref: string | null;
  opened_at: string | null;
  created_at: string;
  sticker_count: number;
}

export interface OpenedPackHistory {
  id: number;
  source: string;
  opened_at: string;
  stickers: PackSticker[];
  /** True when the pack was opened before pack_stickers were persisted. */
  historyIncomplete?: boolean;
}

export interface PackVisualSettings {
  packImageUrl: string;
  openingGifUrl: string | null;
}

export interface PacotinhosStats {
  available: number;
  opened: number;
  totalStickers: number;
}
