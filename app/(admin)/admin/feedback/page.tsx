import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { FeedbackAdminClient, type AdminFeedbackRow } from "./feedback-client";

export const metadata: Metadata = { title: "Feedbacks" };
export const dynamic = "force-dynamic";

export default async function FeedbackAdminPage() {
  const supabase = createAdminClient();

  const { data: rows, error } = await supabase
    .from("user_feedback")
    .select("id, user_id, type, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/feedback/page] list:", error.message);
  }

  const feedbackRows = rows ?? [];
  const userIds = [...new Set(feedbackRows.map((row) => row.user_id))];

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

  const initialData: AdminFeedbackRow[] = feedbackRows.map((row) => ({
    ...row,
    type: row.type as AdminFeedbackRow["type"],
    status: (row.status ?? "pending") as AdminFeedbackRow["status"],
    display_name: profileMap[row.user_id]?.display_name ?? null,
    username: profileMap[row.user_id]?.username ?? null,
    email: emailMap[row.user_id] ?? null,
  }));

  return <FeedbackAdminClient initialData={initialData} />;
}
