import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeId } from "@/lib/sanitize";

/**
 * POST /api/notifications/read
 * Body: { id?: number, announcement_id?: number, all?: boolean }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const now = new Date().toISOString();

  if (body.all === true) {
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .is("read_at", null);

    const { data: announcements } = await supabase
      .from("announcements")
      .select("id")
      .eq("is_active", true);

    if (announcements?.length) {
      await supabase.from("announcement_reads").upsert(
        announcements.map((a) => ({
          user_id: user.id,
          announcement_id: a.id,
          read_at: now,
        })),
        { onConflict: "user_id,announcement_id", ignoreDuplicates: true }
      );
    }

    return NextResponse.json({ success: true });
  }

  const announcementId = sanitizeId(body.announcement_id);
  if (announcementId) {
    await supabase.from("announcement_reads").upsert(
      {
        user_id: user.id,
        announcement_id: announcementId,
        read_at: now,
      },
      { onConflict: "user_id,announcement_id" }
    );
    return NextResponse.json({ success: true });
  }

  const id = sanitizeId(body.id);
  if (!id) {
    return NextResponse.json({ error: "id ou announcement_id é obrigatório" }, { status: 400 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
