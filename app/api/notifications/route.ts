import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchNotificationsForUser } from "@/lib/notifications";

/**
 * GET /api/notifications
 * Lista notificações + avisos não lidos e sincroniza quiz/missões.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, unreadCount } = await fetchNotificationsForUser(
    supabase,
    user.id
  );

  return NextResponse.json({ notifications: items, unread_count: unreadCount });
}
