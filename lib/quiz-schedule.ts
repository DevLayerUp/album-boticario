import type { SupabaseClient } from "@supabase/supabase-js";

/** Campaign calendar day in America/Sao_Paulo (YYYY-MM-DD). */
export function getQuizToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/**
 * Inclusive start / exclusive end of the campaign day, as ISO timestamptz.
 * Brazil has no DST since 2019 — offset is always -03:00.
 */
export function getQuizDayRange(today = getQuizToday()): {
  start: string;
  endExclusive: string;
} {
  const [year, month, day] = today.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const nextDay = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  return {
    start: `${today}T00:00:00.000-03:00`,
    endExclusive: `${nextDay}T00:00:00.000-03:00`,
  };
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
