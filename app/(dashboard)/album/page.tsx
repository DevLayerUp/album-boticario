import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlbumClient } from "./album-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildAppPageMetadata("album");
}

export default async function AlbumPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; category?: string }>;
}) {
  const params = await searchParams;
  const focusSlotId = params.slot ? Number(params.slot) : null;
  const focusCategoryId = params.category ? Number(params.category) : null;
  const validFocusSlotId =
    focusSlotId != null && Number.isFinite(focusSlotId) ? focusSlotId : null;
  const validFocusCategoryId =
    focusCategoryId != null && Number.isFinite(focusCategoryId) ? focusCategoryId : null;

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
    .select("sticker_url, display_name")
    .eq("id", user.id)
    .single();

  // Total slots for progress
  const { count: totalSlots } = await supabase
    .from("album_slots")
    .select("*", { count: "exact", head: true });

  // Album cover URL (read via service_role to bypass RLS on app_settings)
  const adminSupabase = createAdminClient();
  const { data: coverSetting } = await adminSupabase
    .from("app_settings")
    .select("value")
    .eq("key", "album_cover_url")
    .single();

  return (
    <AlbumClient
      categories={categories ?? []}
      initialUserAlbum={userAlbum ?? []}
      initialUserStickers={userStickers ?? []}
      totalSlots={totalSlots ?? 0}
      userStickerUrl={profile?.sticker_url ?? null}
      userDisplayName={profile?.display_name?.trim() || user.user_metadata?.full_name?.trim() || null}
      coverUrl={coverSetting?.value ?? null}
      focusSlotId={validFocusSlotId}
      focusCategoryId={validFocusCategoryId}
    />
  );
}
