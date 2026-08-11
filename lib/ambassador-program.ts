import type { SupabaseClient } from "@supabase/supabase-js";
import { isProfileComplete, type ProfileCompleteFields } from "@/lib/profile-complete";

export const AMBASSADOR_PROGRAM_STARTED_AT_KEY = "ambassador_program_started_at";
export const AMBASSADOR_MISSION_TITLE = "Desafio GB: Divulgue o álbum";
/** Título legado — mantido para migrações/consultas de transição. */
export const AMBASSADOR_MISSION_TITLE_LEGACY = "Divulgue o álbum";

export const AMBASSADOR_MISSION_INSTRUCTIONS =
  "Compartilhe seu link de convite com amigos. Só contam cadastros feitos a partir do lançamento deste desafio, com perfil completo. Não há meta máxima — divulgue o máximo que puder. Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham a camiseta. Para mais informações, acesse o regulamento.";

/** Regulamento oficial do Desafio GB (abre em nova aba). */
export const AMBASSADOR_REGULAMENTO_URL =
  "https://docs.google.com/document/d/1MWVaWHNqwYcSiVDC58BsYiPCUMwRtWnH/edit?usp=sharing&ouid=110253241166582239746&rtpof=true&sd=true";

/** URL do regulamento — env sobrescreve o padrão quando definido. */
export function getAmbassadorRegulamentoUrl(): string {
  const url = process.env.NEXT_PUBLIC_AMBASSADOR_REGULAMENTO_URL?.trim();
  return url || AMBASSADOR_REGULAMENTO_URL;
}

export function isAmbassadorMissionTitle(title: string | null | undefined): boolean {
  return (
    title === AMBASSADOR_MISSION_TITLE || title === AMBASSADOR_MISSION_TITLE_LEGACY
  );
}

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
    .in("title", [AMBASSADOR_MISSION_TITLE, AMBASSADOR_MISSION_TITLE_LEGACY])
    .limit(1)
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
