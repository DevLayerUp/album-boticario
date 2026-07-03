export const EMAIL_CAMPAIGN_CATEGORIES = [
  "aviso",
  "notificacao",
  "novidade",
] as const;

export type EmailCampaignCategory = (typeof EMAIL_CAMPAIGN_CATEGORIES)[number];

export const EMAIL_CAMPAIGN_AUDIENCES = [
  "marketing_opt_in",
  "all_users",
  "admins_test",
  "incomplete_profile",
  "incomplete_first_steps",
  "no_sticker",
  "mission_incomplete",
  "specific_user",
] as const;

export type EmailCampaignAudience = (typeof EMAIL_CAMPAIGN_AUDIENCES)[number];

export const EMAIL_CAMPAIGN_STATUSES = [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
  "cancelled",
] as const;

export type EmailCampaignStatus = (typeof EMAIL_CAMPAIGN_STATUSES)[number];

export interface EmailCampaignAudienceFilter {
  state?: string;
  mission_id?: number;
  user_id?: string;
  /** Rótulo para exibição no admin (nome · e-mail) */
  user_display?: string;
}

export interface EmailCampaignStats {
  total?: number;
  sent?: number;
  failed?: number;
  skipped?: number;
}

export interface EmailCampaign {
  id: number;
  title: string;
  category: EmailCampaignCategory;
  audience: EmailCampaignAudience;
  audience_filter: EmailCampaignAudienceFilter;
  html_body: string;
  scheduled_at: string;
  status: EmailCampaignStatus;
  sent_at: string | null;
  stats: EmailCampaignStats;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  userId: string | null;
  email: string;
  displayName: string | null;
}

export interface CampaignMissionOption {
  id: number;
  title: string;
  is_active: boolean;
}

export const CATEGORY_LABELS: Record<EmailCampaignCategory, string> = {
  aviso: "Aviso",
  notificacao: "Notificação",
  novidade: "Novidade",
};

export const AUDIENCE_LABELS: Record<EmailCampaignAudience, string> = {
  marketing_opt_in: "Marketing opt-in",
  all_users: "Todos os usuários",
  admins_test: "Admins (teste)",
  incomplete_profile: "Perfil incompleto",
  incomplete_first_steps: "Primeiros passos não concluídos",
  no_sticker: "Sem figurinha personalizada",
  mission_incomplete: "Missão não concluída",
  specific_user: "Usuário específico",
};

export const AUDIENCE_GROUPS: {
  label: string;
  audiences: EmailCampaignAudience[];
}[] = [
  {
    label: "Geral",
    audiences: ["marketing_opt_in", "all_users", "admins_test"],
  },
  {
    label: "Dashboard do usuário",
    audiences: ["incomplete_profile", "incomplete_first_steps", "no_sticker"],
  },
  {
    label: "Missões",
    audiences: ["mission_incomplete"],
  },
  {
    label: "Usuário",
    audiences: ["specific_user"],
  },
];

export const STATUS_LABELS: Record<EmailCampaignStatus, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  sending: "Enviando",
  sent: "Enviada",
  failed: "Falhou",
  cancelled: "Cancelada",
};

export function parseAudienceFilter(value: unknown): EmailCampaignAudienceFilter {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const filter: EmailCampaignAudienceFilter = {};

  if (typeof raw.state === "string" && raw.state.trim()) {
    filter.state = raw.state.trim().toUpperCase();
  }

  const missionId = Number(raw.mission_id);
  if (Number.isInteger(missionId) && missionId > 0) {
    filter.mission_id = missionId;
  }

  if (typeof raw.user_id === "string" && raw.user_id.trim()) {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const userId = raw.user_id.trim();
    if (uuidRe.test(userId)) {
      filter.user_id = userId;
    }
  }

  if (typeof raw.user_display === "string" && raw.user_display.trim()) {
    filter.user_display = raw.user_display.trim().slice(0, 200);
  }

  return filter;
}

export function resolveAudienceLabel(
  audience: EmailCampaignAudience,
  audienceFilter: EmailCampaignAudienceFilter,
  missions: CampaignMissionOption[],
): string {
  if (audience === "mission_incomplete" && audienceFilter.mission_id) {
    const mission = missions.find((m) => m.id === audienceFilter.mission_id);
    if (mission) return `Missão pendente: ${mission.title}`;
  }
  if (audience === "specific_user") {
    if (audienceFilter.user_display) return audienceFilter.user_display;
    if (audienceFilter.user_id) return `Usuário: ${audienceFilter.user_id.slice(0, 8)}…`;
  }
  return AUDIENCE_LABELS[audience];
}

export function audienceRequiresMission(audience: EmailCampaignAudience): boolean {
  return audience === "mission_incomplete";
}

export function audienceRequiresUser(audience: EmailCampaignAudience): boolean {
  return audience === "specific_user";
}

export function validateCampaignAudience(
  audience: EmailCampaignAudience,
  audienceFilter: EmailCampaignAudienceFilter,
): string | null {
  if (audienceRequiresMission(audience) && !audienceFilter.mission_id) {
    return "Selecione uma missão para este segmento.";
  }
  if (audienceRequiresUser(audience) && !audienceFilter.user_id) {
    return "Selecione um usuário para este envio.";
  }
  return null;
}

export const LOG_STATUS_LABELS = {
  sent: "Enviado",
  failed: "Falhou",
  skipped: "Ignorado",
} as const;

export type EmailCampaignLogStatus = keyof typeof LOG_STATUS_LABELS;

export interface EmailCampaignLog {
  id: number;
  campaign_id: number;
  user_id: string | null;
  email: string;
  status: EmailCampaignLogStatus;
  resend_id: string | null;
  error: string | null;
  sent_at: string;
  display_name: string | null;
}

export interface CampaignLogsSummary {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  pending: number;
  successRate: number;
}

export interface CampaignTimelineBucket {
  key: string;
  label: string;
  sent: number;
  failed: number;
}

export interface CampaignLogsResponse {
  summary: CampaignLogsSummary;
  timeline: CampaignTimelineBucket[];
  logs: EmailCampaignLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
