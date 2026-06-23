import type { SupabaseClient } from "@supabase/supabase-js";

/** Campaign calendar day in America/Sao_Paulo (YYYY-MM-DD). */
export function getQuizToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export async function getNextAvailableQuizDate(
  supabase: SupabaseClient,
  fromDate?: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("quiz_next_available_date", {
    p_from: fromDate ?? getQuizToday(),
  });

  if (error) throw error;
  return (data as string | null) ?? null;
}

/** Assigns unscheduled (or far-future) quizzes to empty days in the horizon. */
export async function ensureQuizCoverage(
  supabase: SupabaseClient,
  horizonDays = 60,
): Promise<number> {
  const { data, error } = await supabase.rpc("quiz_ensure_coverage", {
    p_horizon_days: horizonDays,
  });

  if (error) throw error;
  return (data as number) ?? 0;
}

export async function resolveQuizValidDate(
  supabase: SupabaseClient,
  validDate: string | null | undefined,
): Promise<string | null> {
  if (validDate?.trim()) return validDate.trim();
  return getNextAvailableQuizDate(supabase);
}
