import {
  dashboardAssets,
  type DashboardCardKey,
} from "@/lib/dashboard-assets";

export const DASHBOARD_FEATURE_CARDS_KEY = "dashboard_feature_cards";

export type DashboardFeatureCardsConfig = Record<DashboardCardKey, string | null>;

export const DASHBOARD_CARD_LABELS: Record<DashboardCardKey, string> = {
  figurinha: "Minha figurinha",
  album: "Meu Álbum",
  colecao: "Minha Coleção",
  pacotinhos: "Pacotinhos",
  quiz: "Quiz Diário",
  missoes: "Missões do Dia",
  trocas: "Central de Trocas",
  ranking: "Ranking dos Fãs",
};

export const DEFAULT_DASHBOARD_FEATURE_CARDS: DashboardFeatureCardsConfig = {
  figurinha: dashboardAssets.cards.figurinha,
  album: dashboardAssets.cards.album,
  colecao: dashboardAssets.cards.colecao,
  pacotinhos: dashboardAssets.cards.pacotinhos,
  quiz: dashboardAssets.cards.quiz,
  missoes: dashboardAssets.cards.missoes,
  trocas: dashboardAssets.cards.trocas,
  ranking: dashboardAssets.cards.ranking,
};

const CARD_KEYS = Object.keys(
  DEFAULT_DASHBOARD_FEATURE_CARDS,
) as DashboardCardKey[];

export function parseDashboardFeatureCards(
  raw: string | null | undefined,
): DashboardFeatureCardsConfig {
  if (!raw?.trim()) return { ...DEFAULT_DASHBOARD_FEATURE_CARDS };

  try {
    const parsed = JSON.parse(raw) as Partial<DashboardFeatureCardsConfig>;
    return mergeDashboardFeatureCards(parsed);
  } catch {
    return { ...DEFAULT_DASHBOARD_FEATURE_CARDS };
  }
}

export function mergeDashboardFeatureCards(
  partial: Partial<DashboardFeatureCardsConfig>,
): DashboardFeatureCardsConfig {
  const base = DEFAULT_DASHBOARD_FEATURE_CARDS;
  return CARD_KEYS.reduce((acc, key) => {
    acc[key] = partial[key] ?? base[key];
    return acc;
  }, {} as DashboardFeatureCardsConfig);
}

export function getFeatureCardBackground(
  key: DashboardCardKey,
  config: DashboardFeatureCardsConfig,
): string | undefined {
  const url = config[key] ?? DEFAULT_DASHBOARD_FEATURE_CARDS[key];
  return url ?? undefined;
}
