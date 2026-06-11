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

export interface CollectionSticker {
  id: number;
  name: string;
  description?: string | null;
  image_url: string;
  is_user_type: boolean;
  sticker_categories: CollectionCategory | null;
  rarities: {
    id: number;
    name: string;
    slug: string;
    color_hex: string;
    animation_type: string;
  } | null;
}
