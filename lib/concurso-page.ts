import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CONCURSO_DEADLINE_ISO,
  CONCURSO_REGULAMENTO_FALLBACK,
  CONCURSO_START_ISO,
} from "@/lib/concurso";
import { dashboardAssets } from "@/lib/dashboard-assets";

export const CONCURSO_PAGE_CONFIG_KEY = "concurso_page_config";

export interface ConcursoPrizeConfig {
  place: string;
  copy: string;
}

export interface ConcursoTimelineItemConfig {
  title: string;
  body: string;
}

export interface ConcursoPageImages {
  heroLogos: string;
  heroWave1: string;
  heroWave2: string;
  heroWave3: string;
  heroWave4: string;
  prizesBackground: string;
  medal1: string;
  medal2: string;
  medal3: string;
  prizeJersey: string;
  sticker1: string;
  sticker2: string;
  sticker3: string;
  clockBadge: string;
  clockIcon: string;
  successBadge: string;
}

export interface ConcursoPageConfig {
  startIso: string;
  deadlineIso: string;
  regulamentoUrl: string;

  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCta: string;

  prizesTitle: string;
  prizesIntro: string;
  prizesQuestion: string;
  prizes: ConcursoPrizeConfig[];
  prizesFooter: string;
  prizesCta: string;

  howTitle: string;
  howBullets: string[];
  howRegulamentoLabel: string;
  howStickerCaption: string;

  formTitle: string;
  formSubtitle: string;
  formQuestion: string;
  formSubmitLabel: string;
  formClosedTitle: string;
  formClosedBody: string;
  formConsentRulesPrefix: string;
  formConsentLinkLabel: string;
  formConsentData: string;

  confirmTitle: string;
  confirmParagraphs: string[];
  confirmButtonLabel: string;

  /** Quando false, só admin vê a página, o menu e o card na dashboard. */
  published: boolean;

  timelineTitle: string;
  timeline: ConcursoTimelineItemConfig[];
  images: ConcursoPageImages;
}

const DEFAULT_PRIZES: ConcursoPrizeConfig[] = [
  {
    place: "1º Lugar",
    copy: "01 Camisa exclusiva autografada pelo jogador Kaká!",
  },
  {
    place: "2º Lugar",
    copy: "01 Camisa exclusiva autografada pelo jogador Kaká!",
  },
  {
    place: "3º Lugar",
    copy: "01 Kit Exclusivo institucional da Fundação Grupo Boticário (com itens promocionais e sustentáveis).",
  },
];

const PREVIOUS_PRIZE_COPY = [
  '01 Camisa exclusiva da campanha "Somos Fãs por Natureza" autografada pelo jogador Kaká!',
  "01 Kit exclusivo institucional da Fundação Grupo Boticário (com itens promocionais e sustentáveis).",
];

const DEFAULT_IMAGES: ConcursoPageImages = {
  heroLogos: dashboardAssets.concurso.logos,
  heroWave1: dashboardAssets.concurso.heroWave1,
  heroWave2: dashboardAssets.concurso.heroWave2,
  heroWave3: dashboardAssets.concurso.heroWave3,
  heroWave4: dashboardAssets.concurso.heroWave4,
  prizesBackground: dashboardAssets.concurso.topo,
  medal1: dashboardAssets.concurso.medal1,
  medal2: dashboardAssets.concurso.medal2,
  medal3: dashboardAssets.concurso.medal3,
  prizeJersey: dashboardAssets.concurso.jersey,
  sticker1: dashboardAssets.concurso.sticker1,
  sticker2: dashboardAssets.concurso.sticker2,
  sticker3: dashboardAssets.concurso.sticker3,
  clockBadge: dashboardAssets.concurso.clock,
  clockIcon: dashboardAssets.concurso.clockIcon,
  successBadge: dashboardAssets.concurso.successBadge,
};

const IMAGE_KEYS = Object.keys(DEFAULT_IMAGES) as (keyof ConcursoPageImages)[];

const DEFAULT_TIMELINE: ConcursoTimelineItemConfig[] = [
  {
    title: "Envie sua resposta!",
    body: "Envio das respostas: Até 30/09/2026 (às 23h59).",
  },
  {
    title: "Avaliação!",
    body: "Avaliação da Comissão: De 01/10/2026 a 07/10/2026.",
  },
  {
    title: "Vencedores!",
    body: "Em outubro de 2026 (nos canais oficiais e notificação na plataforma).",
  },
  {
    title: "Envio dos Prêmios!",
    body: "Envio dos Prêmios: A partir de 20/10/2026.",
  },
];

export const DEFAULT_CONCURSO_PAGE_CONFIG: ConcursoPageConfig = {
  startIso: CONCURSO_START_ISO,
  deadlineIso: CONCURSO_DEADLINE_ISO,
  regulamentoUrl: "",
  published: false,

  heroTitle: "VISTA A CAMISA DA NOSSA NATUREZA!",
  heroHighlight: "NATUREZA",
  heroSubtitle:
    "O maior fã-clube da biodiversidade brasileira tá escalando o time. Chegou a sua hora de entrar em campo!",
  heroDescription:
    "Mostre a sua paixão pela conservação em nosso Concurso Cultural e ganhe prêmios exclusivos",
  heroCta: "GARANTIR MINHA VAGA NO TIME!",

  prizesTitle: "Descubra o que o nosso pódio vai levar!",
  prizesIntro:
    "Quem é fã de verdade da nossa biodiversidade merece reconhecimento à altura! Então, como você demonstra a sua paixão pela natureza?",
  prizesQuestion: "como você demonstra a sua paixão pela natureza?",
  prizes: DEFAULT_PRIZES,
  prizesFooter:
    "A nossa comissão julgadora vai selecionar as respostas mais autênticas, criativas e apaixonadas para definir os grandes campeões.",
  prizesCta: "PARTICIPAR DO CONCURSO!",

  howTitle: "Como funciona a escalação?",
  howBullets: [
    "Quem entra em campo? Qualquer pessoa maior de 18 anos cadastrada na plataforma do nosso álbum de figurinhas.",
    "Prazos de envio: de 21/09/2026 até 30/09/2026, às 23h59 (horário de Brasília).",
    "Critérios de seleção: as respostas serão avaliadas em formato anônimo (sem identificação de autoria), levando em conta Adequação ao Tema, Criatividade/Originalidade e Clareza de Expressão.",
    "Passe único: É permitida apenas UMA resposta por CPF.",
  ],
  howRegulamentoLabel: "*Vem conferir o regulamento completo do Concurso Cultural.",
  howStickerCaption: "Figueira centenária",

  formTitle: "Como funciona a escalação?",
  formSubtitle: "Responda com toda a sua inspiração e autenticidade:",
  formQuestion: "Como você demonstra a sua paixão pela natureza?",
  formSubmitLabel: "Enviar Resposta e Concorrer!",
  formClosedTitle: "Inscrições encerradas",
  formClosedBody: "O prazo de envio foi até 30/09/2026, às 23h59 (horário de Brasília).",
  formConsentRulesPrefix: "Declaro que li e aceito o",
  formConsentLinkLabel: "Regulamento Completo do Concurso",
  formConsentData:
    "Autorizo a Fundação Grupo Boticário a tratar meus dados pessoais para fins deste Concurso e autorizo o uso da minha frase conforme o regulamento.",

  confirmTitle: "Golaço! Resposta enviada com sucesso.",
  confirmParagraphs: [
    "Muito bom ter você junto com a gente na torcida pelo futuro do nosso planeta. Sua resposta já tá nas mãos da nossa comissão julgadora.",
    "O resultado sai a partir de outubro de 2026 nos nossos canais oficiais e por notificação no site do álbum.",
    "Enquanto a comissão avalia, continue colando suas figurinhas, escalando o seu álbum e descobrindo mais sobre as nossas florestas e a nossa biodiversidade!",
  ],
  confirmButtonLabel: "Voltar para o álbum de figurinhas",

  timelineTitle: "Fique de olho no cronômetro",
  timeline: DEFAULT_TIMELINE,
  images: DEFAULT_IMAGES,
};

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function migratedStr(value: unknown, nextDefault: string, previousDefaults: string[]): string {
  if (typeof value !== "string" || !value.trim()) return nextDefault;
  const trimmed = value.trim();
  if (previousDefaults.includes(trimmed)) return nextDefault;
  return trimmed;
}

function optionalUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function validIso(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : value.trim();
}

function mergePrizes(partial?: unknown): ConcursoPrizeConfig[] {
  const rows = Array.isArray(partial) ? partial : [];
  return DEFAULT_PRIZES.map((base, index) => {
    const row = rows[index] as Partial<ConcursoPrizeConfig> | undefined;
    return {
      place: str(row?.place, base.place),
      copy: migratedStr(row?.copy, base.copy, PREVIOUS_PRIZE_COPY),
    };
  });
}

function mergeStringList(
  partial: unknown,
  fallback: string[],
  min: number,
  max: number,
): string[] {
  const rows = Array.isArray(partial)
    ? partial.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim())
    : [];
  const list = rows.length > 0 ? rows : [...fallback];
  const clamped = list.slice(0, max);
  if (clamped.length >= min) return clamped;
  return [...fallback].slice(0, min);
}

function mergeImages(partial?: unknown): ConcursoPageImages {
  const row = (partial && typeof partial === "object" ? partial : {}) as Partial<ConcursoPageImages>;
  return IMAGE_KEYS.reduce((acc, key) => {
    acc[key] = str(row[key], DEFAULT_IMAGES[key]);
    return acc;
  }, {} as ConcursoPageImages);
}

function mergeTimeline(partial?: unknown): ConcursoTimelineItemConfig[] {
  const rows = Array.isArray(partial) ? partial : [];
  const source = rows.length > 0 ? rows : DEFAULT_TIMELINE;
  return source.slice(0, 4).map((item, index) => {
    const row = item as Partial<ConcursoTimelineItemConfig> | undefined;
    const base = DEFAULT_TIMELINE[index] ?? DEFAULT_TIMELINE[0];
    return {
      title: str(row?.title, base.title),
      body: str(row?.body, base.body),
    };
  });
}

export function parseConcursoPageConfig(raw: string | null | undefined): ConcursoPageConfig {
  if (!raw?.trim()) return DEFAULT_CONCURSO_PAGE_CONFIG;
  try {
    return mergeConcursoPageConfig(JSON.parse(raw) as Partial<ConcursoPageConfig>);
  } catch {
    return DEFAULT_CONCURSO_PAGE_CONFIG;
  }
}

export function mergeConcursoPageConfig(
  partial: Partial<ConcursoPageConfig>,
): ConcursoPageConfig {
  const base = DEFAULT_CONCURSO_PAGE_CONFIG;
  return {
    startIso: validIso(partial.startIso, base.startIso),
    deadlineIso: validIso(partial.deadlineIso, base.deadlineIso),
    regulamentoUrl: optionalUrl(partial.regulamentoUrl, base.regulamentoUrl),
    published: partial.published === true,

    heroTitle: str(partial.heroTitle, base.heroTitle),
    heroHighlight: typeof partial.heroHighlight === "string" ? partial.heroHighlight.trim() : base.heroHighlight,
    heroSubtitle: str(partial.heroSubtitle, base.heroSubtitle),
    heroDescription: str(partial.heroDescription, base.heroDescription),
    heroCta: str(partial.heroCta, base.heroCta),

    prizesTitle: str(partial.prizesTitle, base.prizesTitle),
    prizesIntro: migratedStr(partial.prizesIntro, base.prizesIntro, [
      "Quem é fã de verdade da nossa biodiversidade merece reconhecimento à altura! Responda à pergunta “Como você demonstra a sua paixão pela natureza?” e concorra a este pódio histórico:",
    ]),
    prizesQuestion: migratedStr(partial.prizesQuestion, base.prizesQuestion, [
      "Como você demonstra a sua paixão pela natureza?",
    ]),
    prizes: mergePrizes(partial.prizes),
    prizesFooter: str(partial.prizesFooter, base.prizesFooter),
    prizesCta: migratedStr(partial.prizesCta, base.prizesCta, [
      "DESBLOQUEAR MINHA PARTICIPAÇÃO!",
    ]),

    howTitle: str(partial.howTitle, base.howTitle),
    howBullets: mergeStringList(partial.howBullets, base.howBullets, 1, 8),
    howRegulamentoLabel: str(partial.howRegulamentoLabel, base.howRegulamentoLabel),
    howStickerCaption: str(partial.howStickerCaption, base.howStickerCaption),

    formTitle: str(partial.formTitle, base.formTitle),
    formSubtitle: str(partial.formSubtitle, base.formSubtitle),
    formQuestion: str(partial.formQuestion, base.formQuestion),
    formSubmitLabel: str(partial.formSubmitLabel, base.formSubmitLabel),
    formClosedTitle: str(partial.formClosedTitle, base.formClosedTitle),
    formClosedBody: str(partial.formClosedBody, base.formClosedBody),
    formConsentRulesPrefix: str(partial.formConsentRulesPrefix, base.formConsentRulesPrefix),
    formConsentLinkLabel: str(partial.formConsentLinkLabel, base.formConsentLinkLabel),
    formConsentData: str(partial.formConsentData, base.formConsentData),

    confirmTitle: str(partial.confirmTitle, base.confirmTitle),
    confirmParagraphs: mergeStringList(partial.confirmParagraphs, base.confirmParagraphs, 1, 6),
    confirmButtonLabel: str(partial.confirmButtonLabel, base.confirmButtonLabel),

    timelineTitle: str(partial.timelineTitle, base.timelineTitle),
    timeline: mergeTimeline(partial.timeline),
    images: mergeImages(partial.images),
  };
}

export async function loadConcursoPageConfig(
  client: SupabaseClient,
): Promise<ConcursoPageConfig> {
  const { data } = await client
    .from("app_settings")
    .select("value")
    .eq("key", CONCURSO_PAGE_CONFIG_KEY)
    .maybeSingle();

  return parseConcursoPageConfig(data?.value ?? null);
}

export function resolveConcursoRegulamentoUrl(config: ConcursoPageConfig): string {
  const fromConfig = config.regulamentoUrl.trim();
  if (fromConfig) return fromConfig;
  const fromEnv = process.env.NEXT_PUBLIC_CONCURSO_REGULAMENTO_URL?.trim();
  return fromEnv || CONCURSO_REGULAMENTO_FALLBACK;
}

export function canViewConcurso(config: ConcursoPageConfig, isAdmin: boolean): boolean {
  return config.published || isAdmin;
}

export function isConcursoWindowOpen(
  config: ConcursoPageConfig,
  now = new Date(),
): boolean {
  const start = new Date(config.startIso);
  const end = new Date(config.deadlineIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  return now >= start && now <= end;
}

/** datetime-local value treated as Brasília wall-clock. */
export function isoToDatetimeLocal(iso: string): string {
  const match = iso.trim().match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : "";
}

export function datetimeLocalToIso(value: string, endOfMinute = false): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  return endOfMinute ? `${value}:59.999-03:00` : `${value}:00-03:00`;
}
