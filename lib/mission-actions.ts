import { CUSTOM_MISSION_TITLES } from "@/lib/missions";

export interface MissionAction {
  label: string;
  href: string;
}

/** Destinos corretos das missões padrão do layout (ignora links legados no banco). */
export const MISSION_ACTION_BY_TITLE: Record<string, MissionAction> = {
  [CUSTOM_MISSION_TITLES.createSticker]: {
    label: "Criar Figurinha",
    href: "/figurinha",
  },
  [CUSTOM_MISSION_TITLES.completeProfile]: {
    label: "Completar Perfil",
    href: "/perfil",
  },
  [CUSTOM_MISSION_TITLES.inviteFriends]: {
    label: "Convidar Amigos",
    href: "/dashboard#convidar-amigos",
  },
  [CUSTOM_MISSION_TITLES.shareSocial]: {
    label: "Compartilhar",
    href: "/album",
  },
  "Fazer 5 trocas": { label: "Ir para Trocas", href: "/trocas" },
  "Acertar 5 quizzes": { label: "Responder Quiz", href: "/quiz" },
};

export function resolveMissionAction(mission: {
  title: string;
  action_label?: string | null;
  action_href?: string | null;
}): MissionAction {
  const canonical = MISSION_ACTION_BY_TITLE[mission.title];
  if (canonical) {
    return {
      label: mission.action_label?.trim() || canonical.label,
      href: canonical.href,
    };
  }

  return {
    label: mission.action_label?.trim() || "Completar Missão",
    href: mission.action_href?.trim() || "/missoes",
  };
}
