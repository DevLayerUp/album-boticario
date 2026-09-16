export const STICKER_PROMOTION_TZ = "America/Sao_Paulo";

export const DEFAULT_STICKER_PROMOTION_UNLOCK_LOCAL = "2026-09-27T20:00";

export const DEFAULT_STICKER_PROMOTION_MESSAGE =
  "Essa figurinha será desbloqueada apenas no dia 27/09, logo após a missão passar na telinha da sua casa no Domingão com Huck — salve na sua agenda.";

export interface StickerPromotionFields {
  promotion_enabled?: boolean | null;
  promotion_unlocks_at?: string | null;
  promotion_message?: string | null;
}

export function isStickerPromotionLocked(
  sticker: StickerPromotionFields | null | undefined,
  now = new Date(),
): boolean {
  if (!sticker?.promotion_enabled) return false;
  if (!sticker.promotion_unlocks_at) return true;
  const unlocksAt = new Date(sticker.promotion_unlocks_at);
  if (Number.isNaN(unlocksAt.getTime())) return true;
  return now < unlocksAt;
}

export function excludeLockedPromotionStickers<T extends StickerPromotionFields>(
  stickers: T[],
  now = new Date(),
): T[] {
  return stickers.filter((sticker) => !isStickerPromotionLocked(sticker, now));
}

export function formatPromotionDate(iso: string | null | undefined): string {
  if (!iso) return "27/09";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "27/09";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: STICKER_PROMOTION_TZ,
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function resolvePromotionMessage(sticker: StickerPromotionFields): string {
  const custom = sticker.promotion_message?.trim();
  if (custom) return custom;
  const day = formatPromotionDate(sticker.promotion_unlocks_at);
  return `Essa figurinha será desbloqueada apenas no dia ${day}, logo após a missão passar na telinha da sua casa no Domingão com Huck — salve na sua agenda.`;
}

export function toDatetimeLocalBRT(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STICKER_PROMOTION_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Interprets a datetime-local value as America/Sao_Paulo (−03:00). */
export function fromDatetimeLocalBRT(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return null;
  return `${trimmed}:00.000-03:00`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toUtcStamp(date: Date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export function buildPromotionGoogleCalendarUrl(input: {
  title: string;
  details: string;
  unlocksAt: string | null | undefined;
}): string | null {
  if (!input.unlocksAt) return null;
  const start = new Date(input.unlocksAt);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    details: input.details,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildPromotionIcs(input: {
  title: string;
  details: string;
  unlocksAt: string;
}): string {
  const start = new Date(input.unlocksAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const stamp = toUtcStamp(new Date());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fas por Natureza//Figurinha promocional//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:sticker-promo-${toUtcStamp(start)}@faspornatureza`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${icsEscape(input.title)}`,
    `DESCRIPTION:${icsEscape(input.details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadPromotionIcs(input: {
  title: string;
  details: string;
  unlocksAt: string;
  filename?: string;
}) {
  const blob = new Blob([buildPromotionIcs(input)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = input.filename ?? "figurinha-promocional.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const PROMOTION_CALENDAR_TITLE = "Desbloqueio da figurinha promocional";

export function normalizeStickerPromotionInput(input: {
  promotion_enabled?: unknown;
  promotion_unlocks_at?: unknown;
  promotion_message?: unknown;
}):
  | {
      promotion_enabled: boolean;
      promotion_unlocks_at: string | null;
      promotion_message: string | null;
    }
  | { error: string } {
  const enabled = Boolean(input.promotion_enabled);
  if (!enabled) {
    return {
      promotion_enabled: false,
      promotion_unlocks_at: null,
      promotion_message: null,
    };
  }

  const unlocksAt =
    typeof input.promotion_unlocks_at === "string" ? input.promotion_unlocks_at.trim() : "";
  const unlocksDate = unlocksAt ? new Date(unlocksAt) : null;
  if (!unlocksAt || !unlocksDate || Number.isNaN(unlocksDate.getTime())) {
    return { error: "Informe a data de desbloqueio da promoção" };
  }

  const message =
    typeof input.promotion_message === "string" ? input.promotion_message.trim() : "";
  if (!message) {
    return { error: "Informe a mensagem da promoção" };
  }
  if (message.length > 400) {
    return { error: "A mensagem da promoção deve ter no máximo 400 caracteres" };
  }

  return {
    promotion_enabled: true,
    promotion_unlocks_at: unlocksDate.toISOString(),
    promotion_message: message,
  };
}
