import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getQuizToday } from "@/lib/quiz-schedule";

export type NotificationType =
  | "trade_request"
  | "trade_accepted"
  | "trade_rejected"
  | "quiz_available"
  | "mission_complete"
  | "announcement";

export interface NotificationRow {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  dedupe_key: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface AnnouncementNotification {
  id: string;
  type: "announcement";
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
  announcement_id: number;
}

export type AppNotification =
  | (NotificationRow & { source: "notification" })
  | AnnouncementNotification;

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  href?: string | null;
  dedupeKey?: string | null;
  payload?: Record<string, unknown>;
}

/** Insere notificação (service role — bypass RLS). Deduplica por dedupe_key. */
export async function createNotification(input: CreateNotificationInput) {
  const supabase = createAdminClient();
  const row = {
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
    dedupe_key: input.dedupeKey ?? null,
    payload: input.payload ?? {},
  };

  if (input.dedupeKey) {
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", input.userId)
      .eq("dedupe_key", input.dedupeKey)
      .maybeSingle();

    if (existing) return existing.id as number;
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" && input.dedupeKey) return null;
    console.error("[notifications] insert failed:", error.message);
    return null;
  }

  return data.id as number;
}

/** Garante notificação de quiz do dia se ainda não respondeu. */
export async function syncQuizNotification(
  supabase: SupabaseClient,
  userId: string
) {
  const today = getQuizToday();

  const { data: todayAnswer } = await supabase
    .from("user_quiz_answers")
    .select("id")
    .eq("user_id", userId)
    .gte("answered_at", `${today}T00:00:00`)
    .lte("answered_at", `${today}T23:59:59`)
    .maybeSingle();

  if (todayAnswer) return;

  const { data: dated } = await supabase
    .from("quizzes")
    .select("id")
    .eq("valid_date", today)
    .eq("is_active", true)
    .maybeSingle();

  let hasQuiz = !!dated;

  if (!hasQuiz) {
    const { data: answered } = await supabase
      .from("user_quiz_answers")
      .select("quiz_id")
      .eq("user_id", userId);

    const answeredIds = (answered ?? []).map((a) => a.quiz_id as number);

    let q = supabase
      .from("quizzes")
      .select("id")
      .eq("is_active", true)
      .is("valid_date", null)
      .limit(1);

    if (answeredIds.length > 0) {
      q = q.not("id", "in", `(${answeredIds.join(",")})`);
    }

    const { data: random } = await q.maybeSingle();
    hasQuiz = !!random;
  }

  if (!hasQuiz) return;

  await createNotification({
    userId,
    type: "quiz_available",
    title: "Quiz disponível!",
    body: "Responda o quiz de hoje e ganhe pacotinhos.",
    href: "/quiz",
    dedupeKey: `quiz:${today}`,
  });
}

/** Notifica missões concluídas com recompensa pendente. */
export async function syncMissionNotifications(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: rows } = await supabase
    .from("user_missions")
    .select("mission_id, completed_at, missions ( id, title )")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .eq("reward_claimed", false);

  for (const row of rows ?? []) {
    const missionRaw = row.missions;
    const mission = Array.isArray(missionRaw) ? missionRaw[0] : missionRaw;
    if (!mission) continue;

    await createNotification({
      userId,
      type: "mission_complete",
      title: "Conquista desbloqueada!",
      body: `Você completou: ${mission.title}. Resgate sua recompensa.`,
      href: "/missoes",
      dedupeKey: `mission:${mission.id}`,
      payload: { mission_id: mission.id },
    });
  }
}

export async function fetchNotificationsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<{ items: AppNotification[]; unreadCount: number }> {
  await Promise.all([
    syncQuizNotification(supabase, userId),
    syncMissionNotifications(supabase, userId),
  ]);

  const [{ data: notifications }, { data: announcements }, { data: reads }] =
    await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("announcements")
        .select("id, title, body, href, created_at, expires_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("announcement_reads")
        .select("announcement_id")
        .eq("user_id", userId),
    ]);

  const readAnnouncementIds = new Set(
    (reads ?? []).map((r) => r.announcement_id as number)
  );

  const notificationItems: AppNotification[] = (notifications ?? []).map(
    (n) => ({ ...(n as NotificationRow), source: "notification" as const })
  );

  const now = Date.now();
  const activeAnnouncements = (announcements ?? []).filter((a) => {
    if (!a.expires_at) return true;
    return new Date(a.expires_at as string).getTime() > now;
  });

  const announcementItems: AnnouncementNotification[] = activeAnnouncements
    .filter((a) => !readAnnouncementIds.has(a.id as number))
    .map((a) => ({
      id: `announcement:${a.id}`,
      type: "announcement" as const,
      title: a.title as string,
      body: a.body as string,
      href: (a.href as string | null) ?? null,
      read_at: null,
      created_at: a.created_at as string,
      announcement_id: a.id as number,
    }));

  const items = [...announcementItems, ...notificationItems].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const unreadNotifications = (notifications ?? []).filter(
    (n) => !n.read_at
  ).length;
  const unreadAnnouncements = announcementItems.length;
  const unreadCount = unreadNotifications + unreadAnnouncements;

  return { items, unreadCount };
}
