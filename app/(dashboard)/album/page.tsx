import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlbumClient } from "./album-client";

export const metadata: Metadata = { title: "Álbum" };

export default async function AlbumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Categories
  const { data: categories } = await supabase
    .from("sticker_categories")
    .select("id, name, cover_image, description")
    .order("sort_order");

  // User album (pasted slots)
  const { data: userAlbum } = await supabase
    .from("user_album")
    .select("slot_id, sticker_id, pasted_at")
    .eq("user_id", user.id);

  // User stickers inventory
  const { data: userStickers } = await supabase
    .from("user_stickers")
    .select("sticker_id, quantity")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("sticker_url")
    .eq("id", user.id)
    .single();

  // Total slots for progress
  const { count: totalSlots } = await supabase
    .from("album_slots")
    .select("*", { count: "exact", head: true });

  return (
    <AlbumClient
      categories={categories ?? []}
      initialUserAlbum={userAlbum ?? []}
      initialUserStickers={userStickers ?? []}
      totalSlots={totalSlots ?? 0}
      userStickerUrl={profile?.sticker_url ?? null}
    />
  );
}
