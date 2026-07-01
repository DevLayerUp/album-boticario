export const USER_FEEDBACK_TYPES = [
  "bug",
  "suggestion",
  "praise",
  "other",
] as const;

export type UserFeedbackType = (typeof USER_FEEDBACK_TYPES)[number];

export const USER_FEEDBACK_TYPE_LABELS: Record<UserFeedbackType, string> = {
  bug: "Problema",
  suggestion: "Sugestão",
  praise: "Elogio",
  other: "Outro",
};

export const USER_FEEDBACK_MIN_LENGTH = 10;
export const USER_FEEDBACK_MAX_LENGTH = 2000;

export function isUserFeedbackType(value: string): value is UserFeedbackType {
  return (USER_FEEDBACK_TYPES as readonly string[]).includes(value);
}

export function normalizeFeedbackMessage(message: string): string {
  return message.trim().replace(/\s+/g, " ");
}

export const USER_FEEDBACK_STATUSES = [
  "pending",
  "in_progress",
  "resolved",
  "dismissed",
] as const;

export type UserFeedbackStatus = (typeof USER_FEEDBACK_STATUSES)[number];

export const USER_FEEDBACK_STATUS_LABELS: Record<UserFeedbackStatus, string> = {
  pending: "Pendente",
  in_progress: "Em análise",
  resolved: "Resolvido",
  dismissed: "Arquivado",
};

export function isUserFeedbackStatus(value: string): value is UserFeedbackStatus {
  return (USER_FEEDBACK_STATUSES as readonly string[]).includes(value);
}
