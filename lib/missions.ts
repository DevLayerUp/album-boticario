/**
 * Server-side utilities for mission progress.
 * - incrementMissionProgress: called from event handlers (pack open, quiz, trade, etc.)
 * - validarMissoes: reconciles stored progress with actual user activity
 * - claimMissionReward: resgata pacotinhos e pontos de missão concluída
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/notifications";
import { createPacksForUser } from "@/lib/pack";

interface MissionRow {
  id: number;
  title: string;
  type: string | null;
  target_value: number | null;
}

interface UserMissionRow {
  progress: number;
  completed_at: string | null;
  reward_claimed: boolean;
}

interface ProfileSnapshot {
  display_name: string | null;
  avatar_url: string | null;
  sticker_url: string | null;
  bio: string | null;
  social_shared_at: string | null;
}

interface MissionMetrics {
  profile: ProfileSnapshot | null;
  referralCount: number;
  tradeCount: number;
  quizCorrectCount: number;
  openedPacksCount: number;
  pastedStickersCount: number;
  completedAlbumPages: number;
}

export const CUSTOM_MISSION_TITLES = {
  createSticker: "Criar figurinha personalizada",
  completeProfile: "Completar perfil",
  inviteFriends: "Convidar amigos",
  shareSocial: "Compartilhar nas redes",
} as const;

function isProfileComplete(profile: ProfileSnapshot | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.display_name?.trim() &&
      profile.bio?.trim() &&
      (profile.avatar_url || profile.sticker_url),
  );
}

async function loadMissionMetrics(
  supabase: SupabaseClient,
  userId: string,
): Promise<MissionMetrics> {
  const [
    profileRes,
    referralsRes,
    tradesRes,
    quizRes,
    packsRes,
    pastedRes,
    slotsRes,
    userAlbumRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, sticker_url, bio, social_shared_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", userId),
    supabase
      .from("trade_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
    supabase
      .from("user_quiz_answers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_correct", true),
    supabase
      .from("packs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("opened_at", "is", null),
    supabase
      .from("user_album")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("album_slots").select("id, page_id"),
    supabase
      .from("user_album")
      .select("slot_id, album_slots(page_id)")
      .eq("user_id", userId),
  ]);

  const slotsByPage = new Map<number, number>();
  for (const slot of slotsRes.data ?? []) {
    const pageId = slot.page_id as number;
    slotsByPage.set(pageId, (slotsByPage.get(pageId) ?? 0) + 1);
  }

  const pastedByPage = new Map<number, number>();
  for (const entry of userAlbumRes.data ?? []) {
    const slotData = entry.album_slots as { page_id: number } | { page_id: number }[] | null;
    const pageId = Array.isArray(slotData) ? slotData[0]?.page_id : slotData?.page_id;
    if (!pageId) continue;
    pastedByPage.set(pageId, (pastedByPage.get(pageId) ?? 0) + 1);
  }

  let completedAlbumPages = 0;
  for (const [pageId, totalSlots] of slotsByPage) {
    if (totalSlots > 0 && (pastedByPage.get(pageId) ?? 0) >= totalSlots) {
      completedAlbumPages++;
    }
  }

  return {
    profile: profileRes.data,
    referralCount: referralsRes.count ?? 0,
    tradeCount: tradesRes.count ?? 0,
    quizCorrectCount: quizRes.count ?? 0,
    openedPacksCount: packsRes.count ?? 0,
    pastedStickersCount: pastedRes.count ?? 0,
    completedAlbumPages,
  };
}

export function computeMissionActualProgress(
  mission: Pick<MissionRow, "title" | "type">,
  metrics: MissionMetrics,
): number {
  const type = mission.type ?? "custom";

  switch (type) {
    case "trade_count":
      return metrics.tradeCount;
    case "quiz_streak":
      return metrics.quizCorrectCount;
    case "open_packs":
      return metrics.openedPacksCount;
    case "complete_album_page":
      return metrics.completedAlbumPages;
    case "paste_sticker":
      return metrics.pastedStickersCount;
    case "custom":
      switch (mission.title) {
        case CUSTOM_MISSION_TITLES.createSticker:
          return metrics.profile?.sticker_url ? 1 : 0;
        case CUSTOM_MISSION_TITLES.completeProfile:
          return isProfileComplete(metrics.profile) ? 1 : 0;
        case CUSTOM_MISSION_TITLES.inviteFriends:
          return metrics.referralCount;
        case CUSTOM_MISSION_TITLES.shareSocial:
          return metrics.profile?.social_shared_at ? 1 : 0;
        default:
          return 0;
      }
    default:
      return 0;
  }
}

async function syncMissionProgress(
  supabase: SupabaseClient,
  userId: string,
  mission: MissionRow,
  actualProgress: number,
  existing: UserMissionRow | null,
): Promise<boolean> {
  const target = mission.target_value ?? 1;
  const syncedProgress = Math.min(Math.max(actualProgress, 0), target);
  const storedProgress = existing?.progress ?? 0;
  const wasComplete = Boolean(existing?.completed_at);
  const finalProgress = wasComplete ? Math.max(storedProgress, syncedProgress) : syncedProgress;
  const isComplete = wasComplete || finalProgress >= target;

  if (finalProgress === storedProgress && wasComplete === isComplete) {
    return false;
  }

  await supabase.from("user_missions").upsert(
    {
      user_id: userId,
      mission_id: mission.id,
      progress: finalProgress,
      completed_at: isComplete ? (existing?.completed_at ?? new Date().toISOString()) : null,
      reward_claimed: existing?.reward_claimed ?? false,
    },
    { onConflict: "user_id,mission_id" },
  );

  if (isComplete && !wasComplete) {
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

  return true;
}

/**
 * Reconcilia o progresso de todas as missões ativas com a atividade real do usuário.
 * Útil quando o evento de incremento não foi disparado (ex.: missões custom).
 */
export async function validarMissoes(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ updated: number }> {
  const { data: missions, error } = await supabase
    .from("missions")
    .select("id, title, type, target_value")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()");

  if (error || !missions?.length) {
    return { updated: 0 };
  }

  const { data: userMissions } = await supabase
    .from("user_missions")
    .select("mission_id, progress, completed_at, reward_claimed")
    .eq("user_id", userId);

  const progressByMission = new Map(
    (userMissions ?? []).map((row) => [row.mission_id as number, row as UserMissionRow & { mission_id: number }]),
  );

  const metrics = await loadMissionMetrics(supabase, userId);
  let updated = 0;

  for (const mission of missions) {
    const existing = progressByMission.get(mission.id) ?? null;
    if (existing?.completed_at && existing.reward_claimed) continue;

    const actualProgress = computeMissionActualProgress(mission, metrics);
    const changed = await syncMissionProgress(
      supabase,
      userId,
      mission,
      actualProgress,
      existing,
    );
    if (changed) updated++;
  }

  return { updated };
}

export async function incrementMissionProgress(
  supabase: SupabaseClient,
  userId: string,
  missionType: string,
  increment: number = 1,
) {
  const { data: missions } = await supabase
    .from("missions")
    .select("id, title, target_value")
    .eq("type", missionType)
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()");

  for (const mission of missions ?? []) {
    const { data: userMission } = await supabase
      .from("user_missions")
      .select("progress, completed_at, reward_claimed")
      .eq("user_id", userId)
      .eq("mission_id", mission.id)
      .maybeSingle();

    if (userMission?.completed_at) continue;

    const current = (userMission?.progress as number) ?? 0;
    const actualProgress = current + increment;

    await syncMissionProgress(
      supabase,
      userId,
      { ...mission, type: missionType },
      actualProgress,
      userMission,
    );
  }
}

/** Marca a missão de compartilhamento social como concluída para o usuário. */
export async function markSocialShareMission(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase
    .from("profiles")
    .update({ social_shared_at: new Date().toISOString() })
    .eq("id", userId);

  await validarMissoes(supabase, userId);
}

export interface ClaimMissionRewardResult {
  packs_earned: number;
  points_earned: number;
  mission_title: string;
}

/**
 * Resgata a recompensa de uma missão concluída: gera pacotinhos e marca como resgatada.
 */
export async function claimMissionReward(
  supabase: SupabaseClient,
  userId: string,
  missionId: number,
): Promise<ClaimMissionRewardResult> {
  await validarMissoes(supabase, userId);

  const { data: userMission, error: fetchError } = await supabase
    .from("user_missions")
    .select(
      "id, completed_at, reward_claimed, missions(title, reward_packs, reward_points)",
    )
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!userMission?.completed_at) {
    throw new MissionClaimError("Missão não concluída", 400);
  }

  if (userMission.reward_claimed) {
    throw new MissionClaimError("Recompensa já resgatada", 400);
  }

  const missionData = Array.isArray(userMission.missions)
    ? userMission.missions[0]
    : userMission.missions;
  const rewardPacks = (missionData?.reward_packs as number | undefined) ?? 1;
  const rewardPoints = (missionData?.reward_points as number | undefined) ?? 100;
  const missionTitle = (missionData?.title as string | undefined) ?? "Missão";

  if (rewardPacks > 0) {
    const { success, packsCreated } = await createPacksForUser(
      supabase,
      userId,
      "mission",
      String(missionId),
      rewardPacks,
    );

    if (!success || packsCreated < rewardPacks) {
      throw new MissionClaimError(
        "Não foi possível gerar os pacotinhos. Tente novamente.",
        500,
      );
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("user_missions")
    .update({ reward_claimed: true })
    .eq("id", userMission.id)
    .eq("user_id", userId)
    .eq("reward_claimed", false)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!updated) {
    throw new MissionClaimError("Recompensa já resgatada", 400);
  }

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("dedupe_key", `mission:${missionId}`)
    .is("read_at", null);

  return {
    packs_earned: rewardPacks,
    points_earned: rewardPoints,
    mission_title: missionTitle,
  };
}

export class MissionClaimError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "MissionClaimError";
  }
}
