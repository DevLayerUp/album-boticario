export interface Rarity {
  name: string;
  slug: string;
  color_hex: string;
  animation_type?: string;
}

export interface Sticker {
  id: number;
  name: string;
  image_url: string;
  rarities: Rarity | null;
}

export interface Profile {
  id: string;
  display_name: string;
  sticker_url: string | null;
}

export interface Trade {
  id: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message: string | null;
  created_at: string;
  resolved_at: string | null;
  requester_id: string;
  receiver_id: string;
  offered_sticker: Sticker | null;
  requested_sticker: Sticker | null;
  requester: Profile | null;
  receiver: Profile | null;
}

export interface Wish {
  id: number;
  created_at: string;
  sticker: Sticker | null;
  user: Profile | null;
  user_stickers: { sticker: Sticker | null; quantity: number }[];
}

export interface MyWish {
  id: number;
  status: string;
  created_at: string;
  stickers: Sticker | null;
}

export interface TradeableEntry {
  sticker: Sticker | null;
  quantity: number;
}

export interface StockPasteTarget {
  slotId: number;
  categoryId: number;
}

export interface StockItem {
  sticker: Sticker;
  quantity: number;
  spareQuantity?: number;
  isPasted: boolean;
  blocked: boolean;
  hasOpenWish: boolean;
  pasteTarget: StockPasteTarget | null;
}

export type TrocasSection = "solicitar" | "negociacao" | "estoque";
