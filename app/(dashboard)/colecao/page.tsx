import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ColecaoClient } from "./colecao-client";

export const metadata: Metadata = { title: "Coleção" };

export default async function ColecaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // All stickers visible in the app
  const { data: allStickers } = await supabase
    .from("stickers")
    .select(
      `id, name, image_url, is_user_type,
       sticker_categories (id, name),
       rarities (id, name, slug, color_hex, animation_type)`
    )
    .eq("is_active", true)
    .order("id");

  // User inventory
  const { data: userStickers } = await supabase
    .from("user_stickers")
    .select("sticker_id, quantity")
    .eq("user_id", user!.id);

  // Categories for filter
  const { data: categories } = await supabase
    .from("sticker_categories")
    .select("id, name")
    .order("sort_order");

  // Rarities for filter
  const { data: rarities } = await supabase
    .from("rarities")
    .select("id, name, slug, color_hex")
    .order("id");

  const ownedMap = new Map(
    (userStickers ?? []).map((s) => [s.sticker_id, s.quantity])
  );

  // Supabase returns 1:1 joins as arrays; normalise to single objects
  const raw = (allStickers ?? []) as Array<{
    id: number; name: string; image_url: string; is_user_type: boolean;
    sticker_categories: { id: number; name: string }[] | { id: number; name: string } | null;
    rarities: { id: number; name: string; slug: string; color_hex: string; animation_type: string }[] | { id: number; name: string; slug: string; color_hex: string; animation_type: string } | null;
  }>;
  const normalised = raw.map((s) => ({
    ...s,
    sticker_categories: Array.isArray(s.sticker_categories)
      ? (s.sticker_categories[0] ?? null)
      : s.sticker_categories,
    rarities: Array.isArray(s.rarities)
      ? (s.rarities[0] ?? null)
      : s.rarities,
  }));

  return (
    <ColecaoClient
      allStickers={normalised}
      ownedMap={Object.fromEntries(ownedMap)}
      categories={categories ?? []}
      rarities={rarities ?? []}
    />
  );
}
