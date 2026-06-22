import { dashboardAssets } from "@/lib/dashboard-assets";

export const FIRST_STEPS_CONFIG_KEY = "first_steps_config";
export const FIRST_STEPS_MIN = 1;
export const FIRST_STEPS_MAX = 10;

/** Número de passos no config padrão (referência histórica). */
export const DEFAULT_FIRST_STEPS_COUNT = 3;

export type FirstStepsPanelTheme = "verde-escuro" | "amarelo" | "verde";
export type FirstStepsBadgeVariant = "light" | "dark";

/** @deprecated formato antigo — usado só na migração de configs salvas */
interface LegacyFirstStepsStepImages {
  primary?: string | null;
  imageA?: string | null;
  imageB?: string | null;
  imageC?: string | null;
  accent?: string | null;
}

export interface FirstStepsStepConfig {
  title: string;
  description: string;
  panelTheme: FirstStepsPanelTheme;
  badgeVariant: FirstStepsBadgeVariant;
  backgroundImage: string | null;
}

export interface FirstStepsConfig {
  enabled: boolean;
  skipLabel: string;
  footerText: string;
  backLabel: string;
  nextLabel: string;
  finishLabel: string;
  steps: FirstStepsStepConfig[];
}

const DEFAULT_BG = dashboardAssets.quiz.background;

export const DEFAULT_FIRST_STEPS_CONFIG: FirstStepsConfig = {
  enabled: true,
  skipLabel: "Pular introdução",
  footerText: "© 2026 Grupo Boticário · Fãs da Natureza",
  backLabel: "Voltar",
  nextLabel: "Avançar",
  finishLabel: "Começar a colecionar",
  steps: [
    {
      title: "Início",
      description:
        "Que bom te ver por aqui! Aqui você joga junto com a nossa comunidade para colecionar espécies incríveis e completar o seu álbum digital.",
      panelTheme: "verde-escuro",
      badgeVariant: "light",
      backgroundImage: DEFAULT_BG,
    },
    {
      title: "Cole no seu álbum",
      description:
        "Organize as figurinhas nos slots do álbum digital, vire as páginas e acompanhe seu progresso até completar 100% da coleção 2026.",
      panelTheme: "amarelo",
      badgeVariant: "dark",
      backgroundImage: DEFAULT_BG,
    },
    {
      title: "Troque com a comunidade",
      description:
        "Repetidas? Troque com outros colecionadores, participe do quizz diário e suba no ranking dos maiores fãs por natureza.",
      panelTheme: "verde",
      badgeVariant: "light",
      backgroundImage: DEFAULT_BG,
    },
  ],
};

const PANEL_THEMES: FirstStepsPanelTheme[] = ["verde-escuro", "amarelo", "verde"];

/** Passo em branco para adicionar no admin. */
export function createEmptyFirstStep(index: number): FirstStepsStepConfig {
  const panelTheme = PANEL_THEMES[index % PANEL_THEMES.length];
  return {
    title: `Novo passo ${index + 1}`,
    description: "",
    panelTheme,
    badgeVariant: panelTheme === "amarelo" ? "dark" : "light",
    backgroundImage: DEFAULT_BG,
  };
}

function pickLegacyBackground(
  legacy?: LegacyFirstStepsStepImages,
): string | null {
  if (!legacy) return null;
  return (
    legacy.primary ??
    legacy.imageA ??
    legacy.imageB ??
    legacy.imageC ??
    legacy.accent ??
    null
  );
}

function mergeStep(
  fallback: FirstStepsStepConfig,
  partial?: Partial<FirstStepsStepConfig> & { images?: LegacyFirstStepsStepImages },
): FirstStepsStepConfig {
  if (!partial) return fallback;

  const legacyBg = pickLegacyBackground(partial.images);
  const backgroundImage =
    partial.backgroundImage !== undefined
      ? partial.backgroundImage
      : legacyBg ?? fallback.backgroundImage;

  return {
    title: partial.title?.trim() || fallback.title,
    description: partial.description?.trim() || fallback.description,
    panelTheme: partial.panelTheme ?? fallback.panelTheme,
    badgeVariant: partial.badgeVariant ?? fallback.badgeVariant,
    backgroundImage,
  };
}

export function parseFirstStepsConfig(raw: string | null | undefined): FirstStepsConfig {
  if (!raw?.trim()) return DEFAULT_FIRST_STEPS_CONFIG;
  try {
    const parsed = JSON.parse(raw) as Partial<FirstStepsConfig>;
    return mergeFirstStepsConfig(parsed);
  } catch {
    return DEFAULT_FIRST_STEPS_CONFIG;
  }
}

export function mergeFirstStepsConfig(partial: Partial<FirstStepsConfig>): FirstStepsConfig {
  const base = DEFAULT_FIRST_STEPS_CONFIG;
  const partialSteps = partial.steps;

  let steps: FirstStepsStepConfig[];
  if (!partialSteps?.length) {
    steps = [...base.steps];
  } else {
    steps = partialSteps.map((step, index) =>
      mergeStep(base.steps[index] ?? createEmptyFirstStep(index), step),
    );
  }

  if (steps.length < FIRST_STEPS_MIN) {
    steps = [...base.steps].slice(0, FIRST_STEPS_MIN);
  }
  if (steps.length > FIRST_STEPS_MAX) {
    steps = steps.slice(0, FIRST_STEPS_MAX);
  }

  return {
    enabled: partial.enabled ?? base.enabled,
    skipLabel: partial.skipLabel?.trim() || base.skipLabel,
    footerText: partial.footerText?.trim() || base.footerText,
    backLabel: partial.backLabel?.trim() || base.backLabel,
    nextLabel: partial.nextLabel?.trim() || base.nextLabel,
    finishLabel: partial.finishLabel?.trim() || base.finishLabel,
    steps,
  };
}

export function panelThemeClass(theme: FirstStepsPanelTheme): string {
  switch (theme) {
    case "amarelo":
      return "bg-amarelo";
    case "verde":
      return "bg-verde-500";
    default:
      return "bg-verde-escuro-500";
  }
}
