import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Heart,
  HelpCircle,
  Pencil,
  Share2,
  User,
  UserPlus,
} from "lucide-react";

export type MissionThemeKey = "green" | "blue" | "brown" | "gold";

export interface MissionTheme {
  surface: string;
  title: string;
  statusLabel: string;
  badge: string;
  badgeText: string;
  button: string;
  iconBg: string;
  progressFill: string;
  progressText: string;
  modalSurface: string;
  featured?: boolean;
}

export const MISSION_THEMES: Record<MissionThemeKey, MissionTheme> = {
  green: {
    surface: "bg-surface-green",
    title: "text-verde-500",
    statusLabel: "text-verde-500",
    badge: "bg-verde-500 text-verde-100",
    badgeText: "text-verde-100",
    button: "bg-verde-500 hover:bg-verde-600",
    iconBg: "bg-verde-500",
    progressFill: "bg-verde-escuro-500",
    progressText: "text-verde-escuro-500",
    modalSurface: "bg-surface-green",
  },
  blue: {
    surface: "bg-[#e3f6fb]",
    title: "text-azul-500",
    statusLabel: "text-azul-500",
    badge: "bg-azul-500 text-azul-100",
    badgeText: "text-azul-100",
    button: "bg-azul-500 hover:bg-azul-400",
    iconBg: "bg-azul-500",
    progressFill: "bg-azul-escuro-500",
    progressText: "text-azul-escuro-500",
    modalSurface: "bg-[#e3f6fb]",
  },
  brown: {
    surface: "bg-[#f6ead1]",
    title: "text-gold-700",
    statusLabel: "text-gold-700",
    badge: "bg-gold-700 text-[#f6ead1]",
    badgeText: "text-[#f6ead1]",
    button: "bg-gold-700 hover:bg-gold-500",
    iconBg: "bg-gold-700",
    progressFill: "bg-[#71410a]",
    progressText: "text-[#71410a]",
    modalSurface: "bg-[#f6ead1]",
  },
  gold: {
    surface:
      "mission-satin-gold relative overflow-hidden ring-2 ring-[#c9a227]/55 shadow-[0_8px_24px_rgba(181,125,2,0.18)]",
    title: "text-[#71410a]",
    statusLabel: "text-[#8a5a08]",
    badge:
      "bg-gradient-to-r from-[#8a5a08] via-[#d2a309] to-[#8a5a08] text-[#fff8e7] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
    badgeText: "text-[#fff8e7]",
    button:
      "bg-gradient-to-r from-[#8a5a08] via-[#d2a309] to-[#b57d02] hover:from-[#71410a] hover:via-[#d2a309] hover:to-[#8a5a08] shadow-[0_2px_8px_rgba(181,125,2,0.35)]",
    iconBg:
      "bg-gradient-to-br from-[#ffe07a] via-[#d2a309] to-[#8a5a08] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
    progressFill: "bg-gradient-to-r from-[#8a5a08] via-[#d2a309] to-[#ffe07a]",
    progressText: "text-[#71410a]",
    modalSurface: "mission-satin-gold relative overflow-hidden",
    featured: true,
  },
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  custom: Pencil,
  trade_count: ArrowLeftRight,
  quiz_streak: HelpCircle,
  complete_profile: User,
  invite_friends: UserPlus,
  share_social: Share2,
};

const TITLE_ICONS: Record<string, LucideIcon> = {
  "Criar figurinha personalizada": Pencil,
  "Completar perfil": User,
  "Fazer 5 trocas": ArrowLeftRight,
  "Acertar 5 quizzes": HelpCircle,
  "Convidar amigos": UserPlus,
  "Divulgue o álbum": UserPlus,
  "Desafio GB: Divulgue o álbum": UserPlus,
  "Compartilhar nas redes": Share2,
  "Seguir a Fundação nas redes": Heart,
  "Fazer 15 trocas": ArrowLeftRight,
  "Fazer 25 trocas": ArrowLeftRight,
  "Fazer 50 trocas": ArrowLeftRight,
  "Fazer 75 trocas": ArrowLeftRight,
  "Fazer 100 trocas": ArrowLeftRight,
  "Acertar 10 quizzes": HelpCircle,
  "Acertar 15 quizzes": HelpCircle,
  "Acertar 20 quizzes": HelpCircle,
  "Acertar 30 quizzes": HelpCircle,
  "Acertar 50 quizzes": HelpCircle,
};

export function missionIcon(title: string, type: string): LucideIcon {
  return TITLE_ICONS[title] ?? TYPE_ICONS[type] ?? Pencil;
}

export function missionTheme(theme: string | null | undefined): MissionTheme {
  const key = theme as MissionThemeKey;
  return MISSION_THEMES[key] ?? MISSION_THEMES.green;
}

export type MissionStatus = "AGUARDANDO" | "EM ANDAMENTO" | "COMPLETA";

export function missionStatus(
  progress: number,
  target: number | null,
  completedAt: string | null,
): MissionStatus {
  if (completedAt) return "COMPLETA";
  if (target == null) return progress > 0 ? "EM ANDAMENTO" : "AGUARDANDO";
  if (progress > 0) return "EM ANDAMENTO";
  return "AGUARDANDO";
}

export function missionProgressPercent(progress: number, target: number | null) {
  if (target == null || target <= 0) return 0;
  return Math.min(100, Math.round((progress / target) * 100));
}

export function missionProgressLabel(
  progress: number,
  target: number | null,
  unit: string | null,
) {
  const unitLabel = unit?.trim() || "convites";
  if (target == null) {
    return `${progress} ${unitLabel}`;
  }
  if (unit) return `${progress}/${target} ${unit}`;
  return `${progress}/${target}`;
}

export function missionCardButtonLabel(
  status: MissionStatus,
  rewardClaimed: boolean,
) {
  if (status === "COMPLETA" && rewardClaimed) return "Recompensa Resgatada";
  if (status === "COMPLETA" && !rewardClaimed) return "Resgatar Recompensa";
  return "Completar Missão";
}

export const LEVEL_NAME = "Explorador da Natureza";
