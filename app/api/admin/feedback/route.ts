import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();

  const { data: rows, error } = await supabase
    .from("user_feedback")
    .select("id, user_id, type, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/feedback] list:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const feedbackIds = (rows ?? []).map((row) => row.id);
  const replyMap: Record<number, { admin_reply: string | null; admin_reply_at: string | null }> =
    {};

  if (feedbackIds.length > 0) {
    const { data: replyRows, error: replyErr } = await supabase
      .from("user_feedback")
      .select("id, admin_reply, admin_reply_at")
      .in("id", feedbackIds);

    if (!replyErr) {
      for (const row of replyRows ?? []) {
        replyMap[row.id] = {
          admin_reply: row.admin_reply ?? null,
          admin_reply_at: row.admin_reply_at ?? null,
        };
      }
    }
  }

  const userIds = [...new Set((rows ?? []).map((row) => row.user_id))];
  const emailMap: Record<string, string | null> = {};

  if (userIds.length > 0) {
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    for (const authUser of authData?.users ?? []) {
      if (userIds.includes(authUser.id)) {
        emailMap[authUser.id] = authUser.email ?? null;
      }
    }
  }

  const profileMap: Record<string, { display_name: string | null; username: string | null }> =
    {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", userIds);

    for (const profile of profiles ?? []) {
      profileMap[profile.id] = {
        display_name: profile.display_name,
        username: profile.username,
      };
    }
  }

  const feedback = (rows ?? []).map((row) => ({
    ...row,
    status: row.status ?? "pending",
    admin_reply: replyMap[row.id]?.admin_reply ?? null,
    admin_reply_at: replyMap[row.id]?.admin_reply_at ?? null,
    display_name: profileMap[row.user_id]?.display_name ?? null,
    username: profileMap[row.user_id]?.username ?? null,
    email: emailMap[row.user_id] ?? null,
  }));

  return NextResponse.json({ feedback });
}
