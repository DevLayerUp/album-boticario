export const TIER_GROUP_TRADE = "trade";
export const TIER_GROUP_QUIZ = "quiz";

/** Tier 1 de cada cadeia — missões legadas já em produção (não alterar). */
export const LEGACY_TIER_1_TITLE_BY_GROUP: Record<string, string> = {
  [TIER_GROUP_TRADE]: "Fazer 5 trocas",
  [TIER_GROUP_QUIZ]: "Acertar 5 quizzes",
};

export interface MissionTierFields {
  id: number;
  title: string;
  tier_group?: string | null;
  tier_order?: number | null;
}

export interface UserMissionClaimState {
  mission_id: number;
  reward_claimed: boolean;
}

export function isTieredMission(
  mission: Pick<MissionTierFields, "tier_group" | "tier_order">,
): boolean {
  return Boolean(mission.tier_group && mission.tier_order != null && mission.tier_order >= 2);
}

function isLegacyTier1Claimed(
  tierGroup: string,
  missions: MissionTierFields[],
  claimByMissionId: Map<number, boolean>,
): boolean {
  const legacyTitle = LEGACY_TIER_1_TITLE_BY_GROUP[tierGroup];
  if (!legacyTitle) return false;
  const legacy = missions.find((m) => m.title === legacyTitle);
  if (!legacy) return false;
  return claimByMissionId.get(legacy.id) === true;
}

/** Tier desbloqueado quando o tier anterior da cadeia foi resgatado. */
export function isTierMissionUnlocked(
  mission: MissionTierFields,
  missions: MissionTierFields[],
  claimByMissionId: Map<number, boolean>,
): boolean {
  if (!isTieredMission(mission) || !mission.tier_group || mission.tier_order == null) {
    return true;
  }

  if (mission.tier_order === 2) {
    return isLegacyTier1Claimed(mission.tier_group, missions, claimByMissionId);
  }

  const previous = missions.find(
    (m) =>
      m.tier_group === mission.tier_group &&
      m.tier_order === mission.tier_order! - 1,
  );
  if (!previous) return false;
  return claimByMissionId.get(previous.id) === true;
}

/**
 * Exibe tiers já resgatados + o próximo tier desbloqueado.
 * Tiers futuros ficam ocultos até o anterior ser resgatado.
 */
export function isTierMissionVisible(
  mission: MissionTierFields,
  missions: MissionTierFields[],
  claimByMissionId: Map<number, boolean>,
): boolean {
  if (!isTieredMission(mission) || !mission.tier_group || mission.tier_order == null) {
    return true;
  }

  if (!isTierMissionUnlocked(mission, missions, claimByMissionId)) {
    return false;
  }

  if (claimByMissionId.get(mission.id)) {
    return true;
  }

  const groupTiers = missions
    .filter((m) => m.tier_group === mission.tier_group && isTieredMission(m))
    .sort((a, b) => (a.tier_order ?? 0) - (b.tier_order ?? 0));

  const activeTier = groupTiers.find((m) => !claimByMissionId.get(m.id));
  return activeTier?.id === mission.id;
}

export function filterVisibleMissions<T extends MissionTierFields>(
  missions: T[],
  userMissions: UserMissionClaimState[],
): T[] {
  const claimByMissionId = new Map(
    userMissions.map((row) => [row.mission_id, row.reward_claimed]),
  );

  return missions.filter((mission) =>
    isTierMissionVisible(mission, missions, claimByMissionId),
  );
}

/** Título da missão custom de seguir redes (espelha seed SQL). */
export const FOLLOW_SOCIAL_MISSION_TITLE = "Seguir a Fundação nas redes";
