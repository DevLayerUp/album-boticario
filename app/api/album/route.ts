import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { patchAlbumPagesWithUserSticker } from "@/lib/user-sticker";

/**
 * GET /api/album?category_id=1
 * Returns pages, slots (with sticker + rarity) and user_album entries for the caller.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");

  // 1. Pages + slots + sticker data
  let query = supabase
    .from("album_pages")
    .select(
      `id, page_number, title, background_url, layout_template, category_id, page_type, content,
       album_slots (
         id, slot_number, position_x, position_y,
         stickers (
           id, name, description, image_url, is_user_type, redirect_url,
           rarities (name, slug, color_hex, animation_type)
         )
       )`
    )
    .order("page_number");

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data: pages, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("sticker_url")
    .eq("id", user.id)
    .maybeSingle();

  const userStickerUrl = profile?.sticker_url ?? null;
  const patchedPages = patchAlbumPagesWithUserSticker(pages, userStickerUrl);

  // 2. User album entries (which slots are pasted)
  const { data: userAlbum } = await supabase
    .from("user_album")
    .select("slot_id, sticker_id, pasted_at")
    .eq("user_id", user.id);

  // 3. User sticker inventory (to know what they own)
  const { data: userStickers } = await supabase
    .from("user_stickers")
    .select("sticker_id, quantity")
    .eq("user_id", user.id);

  return NextResponse.json({
    pages: patchedPages,
    userStickerUrl,
    userAlbum: userAlbum ?? [],
    userStickers: userStickers ?? [],
  });
}
