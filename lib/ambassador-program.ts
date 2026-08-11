import type { SupabaseClient } from "@supabase/supabase-js";
import { isProfileComplete, type ProfileCompleteFields } from "@/lib/profile-complete";

export const AMBASSADOR_PROGRAM_STARTED_AT_KEY = "ambassador_program_started_at";
export const AMBASSADOR_MISSION_TITLE = "Divulgue o álbum";

export type AmbassadorReferredProfile = ProfileCompleteFields & {
  created_at: string;
};

/** Início da contagem do programa (indicados com created_at >= este instante). */
export async function getAmbassadorProgramStartedAt(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data: setting } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", AMBASSADOR_PROGRAM_STARTED_AT_KEY)
    .maybeSingle();

  const fromSetting = parseStartedAt(setting?.value);
  if (fromSetting) return fromSetting;

  const { data: mission } = await supabase
    .from("missions")
    .select("created_at")
    .eq("title", AMBASSADOR_MISSION_TITLE)
    .maybeSingle();

  return mission?.created_at ?? null;
}

function parseStartedAt(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    const ms = Date.parse(value.trim());
    return Number.isNaN(ms) ? null : new Date(ms).toISOString();
  }
  if (value && typeof value === "object" && "at" in value) {
    const at = (value as { at?: unknown }).at;
    if (typeof at === "string" && at.trim()) {
      const ms = Date.parse(at.trim());
      return Number.isNaN(ms) ? null : new Date(ms).toISOString();
    }
  }
  return null;
}

/** Indicação elegível ao programa de divulgação (nova contagem, pós-lançamento). */
export function isAmbassadorReferralInProgram(
  createdAt: string | null | undefined,
  programStartedAt: string | null,
): boolean {
  if (!createdAt) return false;
  if (!programStartedAt) return true;
  return Date.parse(createdAt) >= Date.parse(programStartedAt);
}

export function countAmbassadorCompleteReferrals(
  referred: AmbassadorReferredProfile[],
  programStartedAt: string | null,
): number {
  return referred.filter(
    (row) =>
      isAmbassadorReferralInProgram(row.created_at, programStartedAt) &&
      isProfileComplete(row),
  ).length;
}

export function countAmbassadorSignups(
  referred: Array<{ created_at: string }>,
  programStartedAt: string | null,
): number {
  return referred.filter((row) =>
    isAmbassadorReferralInProgram(row.created_at, programStartedAt),
  ).length;
}
