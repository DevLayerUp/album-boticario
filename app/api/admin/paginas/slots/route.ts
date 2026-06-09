import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminGuard } from "@/lib/admin-guard";

/**
 * GET /api/admin/paginas/slots?page_id=1
 * Returns all slots for a page with current sticker_id assignments.
 */
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("page_id");
  if (!pageId) return NextResponse.json({ error: "page_id é obrigatório" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("album_slots")
    .select(`id, slot_number, sticker_id,
      stickers ( id, name, image_url, rarities ( name, color_hex ) )
    `)
    .eq("page_id", pageId)
    .order("slot_number");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/**
 * PATCH /api/admin/paginas/slots
 * Bulk-update sticker_id assignments for album_slots.
 * Body: { assignments: Array<{ slot_id: number, sticker_id: number | null }> }
 */
export async function PATCH(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const body = await request.json().catch(() => ({}));
  const { assignments } = body as {
    assignments?: Array<{ slot_id: number; sticker_id: number | null }>;
  };

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return NextResponse.json({ error: "assignments é obrigatório" }, { status: 400 });
  }

  const errors: string[] = [];

  for (const a of assignments) {
    const { error } = await supabase
      .from("album_slots")
      .update({ sticker_id: a.sticker_id })
      .eq("id", a.slot_id);
    if (error) errors.push(`Slot ${a.slot_id}: ${error.message}`);
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: assignments.length });
}
