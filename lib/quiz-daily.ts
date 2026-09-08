import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ensureQuizCoverage,
  getQuizDayRange,
  getQuizToday,
} from "@/lib/quiz-schedule";

const QUIZ_SELECT = "id, question, image_url, points, quiz_options(id, text)";

export type DailyQuizRow = {
  id: number;
  question: string;
  image_url: string | null;
  points: number;
  quiz_options: { id: number; text: string }[] | null;
};

export async function getTodayQuizAnswer(
  supabase: SupabaseClient,
  userId: string,
) {
  const { start, endExclusive } = getQuizDayRange();
  const { data } = await supabase
    .from("user_quiz_answers")
    .select("id, is_correct, quiz_id")
    .eq("user_id", userId)
    .gte("answered_at", start)
    .lt("answered_at", endExclusive)
    .order("answered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

/**
 * Quiz do dia: agenda de hoje, senão qualquer ativo ainda não respondido
 * com data nula ou já vencida (não antecipa o quiz de amanhã).
 */
export async function findAvailableDailyQuiz(
  supabase: SupabaseClient,
  userId: string,
): Promise<DailyQuizRow | null> {
  const today = getQuizToday();

  const { data: scheduled } = await supabase
    .from("quizzes")
    .select("id")
    .eq("valid_date", today)
    .eq("is_active", true)
    .maybeSingle();

  if (!scheduled) {
    try {
      await ensureQuizCoverage(createAdminClient(), 60);
    } catch {
      /* cobertura é best-effort — segue com o que houver no banco */
    }
  }

  const { data: answered } = await supabase
    .from("user_quiz_answers")
    .select("quiz_id")
    .eq("user_id", userId);

  const answeredIds = new Set(
    (answered ?? []).map((row) => row.quiz_id as number),
  );

  const { data: dated } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("valid_date", today)
    .eq("is_active", true)
    .maybeSingle();

  const datedQuiz = dated as DailyQuizRow | null;
  if (datedQuiz && !answeredIds.has(datedQuiz.id)) {
    return datedQuiz;
  }

  let query = supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("is_active", true)
    .or(`valid_date.is.null,valid_date.lte.${today}`)
    .order("valid_date", { ascending: false, nullsFirst: true });

  if (answeredIds.size > 0) {
    query = query.not("id", "in", `(${[...answeredIds].join(",")})`);
  }

  const { data: fallback } = await query.limit(1).maybeSingle();
  return (fallback as DailyQuizRow | null) ?? null;
}

export function shuffleQuizOptions(
  options: DailyQuizRow["quiz_options"],
): { id: number; text: string }[] {
  if (!Array.isArray(options)) return [];
  return [...options].sort(() => Math.random() - 0.5);
}
