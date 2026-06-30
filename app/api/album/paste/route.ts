import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { incrementMissionProgress } from "@/lib/missions";

/**
 * POST /api/album/paste
 * Body: { slot_id: number, sticker_id: number }
 * Pastes a sticker the user owns into an empty slot.
 * Inventory quantity is unchanged — duplicates for trade stay at quantity > 1.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { slot_id, sticker_id } = body as { slot_id?: number; sticker_id?: number };

  if (!slot_id || !sticker_id) {
    return NextResponse.json({ error: "slot_id and sticker_id are required" }, { status: 400 });
  }

  // 1. Check ownership
  const { data: owned } = await supabase
    .from("user_stickers")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("sticker_id", sticker_id)
    .single();

  if (!owned || owned.quantity < 1) {
    return NextResponse.json({ error: "Você não possui esta figurinha" }, { status: 400 });
  }

  // 2. Check slot is not already pasted
  const { data: existing } = await supabase
    .from("user_album")
    .select("id")
    .eq("user_id", user.id)
    .eq("slot_id", slot_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Este slot já está preenchido" }, { status: 409 });
  }

  // 3. Paste sticker into album
  const { error: pasteErr } = await supabase.from("user_album").insert({
    user_id: user.id,
    slot_id,
    sticker_id,
  });

  if (pasteErr) return NextResponse.json({ error: pasteErr.message }, { status: 500 });

  // 4. Increment mission progress for album_paste
  await incrementMissionProgress(supabase, user.id, "complete_album_page", 0); // tracked per page elsewhere
  await incrementMissionProgress(supabase, user.id, "paste_sticker", 1);

  return NextResponse.json({ success: true });
}
