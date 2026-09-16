export interface CollectionSticker {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  is_user_type: boolean;
  promotion_enabled?: boolean | null;
  promotion_unlocks_at?: string | null;
  promotion_message?: string | null;
  sticker_categories: { id: number; name: string } | null;
  rarities: {
    id: number;
    name: string;
    slug: string;
    color_hex: string;
    animation_type: string;
  } | null;
}

export interface CollectionCategory {
  id: number;
  name: string;
}

export interface CollectionRarity {
  id: number;
  name: string;
  slug: string;
  color_hex: string;
}
