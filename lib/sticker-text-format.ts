/** Max length for sticker name (includes markup). */
export const STICKER_NAME_MAX_LENGTH = 160;

const SCI_MARKUP_RE = /\{\{sci\|([^}]*)\}\}/g;

export type StickerTextSegment =
  | { type: "text"; value: string }
  | { type: "scientific"; value: string };

/** Gênero com inicial maiúscula; epíteto(s) em minúsculas (nomenclatura binomial). */
export function formatScientificName(raw: string): string {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";

  const genus =
    parts[0].charAt(0).toLocaleUpperCase("pt-BR") +
    parts[0].slice(1).toLocaleLowerCase("pt-BR");

  if (parts.length === 1) return genus;

  const epithet = parts
    .slice(1)
    .map((word) => word.toLocaleLowerCase("pt-BR"))
    .join(" ");

  return `${genus} ${epithet}`;
}

export function parseStickerFormattedText(input: string): StickerTextSegment[] {
  if (!input) return [];

  const segments: StickerTextSegment[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(SCI_MARKUP_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: input.slice(lastIndex, index) });
    }
    segments.push({ type: "scientific", value: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ type: "text", value: input.slice(lastIndex) });
  }

  if (!segments.length) {
    segments.push({ type: "text", value: input });
  }

  return segments;
}

/** Texto sem marcação — útil para alt, aria-label e busca. */
export function stickerTextToPlain(input: string): string {
  return parseStickerFormattedText(input)
    .map((segment) =>
      segment.type === "scientific"
        ? `(${formatScientificName(segment.value)})`
        : segment.value,
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateStickerFormattedText(
  value: string | null | undefined,
  maxLength: number,
  fieldLabel: string,
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  if (trimmed.length > maxLength) {
    return `${fieldLabel} deve ter no máximo ${maxLength} caracteres`;
  }

  const openCount = (trimmed.match(/\{\{/g) ?? []).length;
  const closeCount = (trimmed.match(/\}\}/g) ?? []).length;
  if (openCount !== closeCount) {
    return "Marcação incompleta. Use o botão «Nome científico» ou feche com }}.";
  }

  if (/\{\{(?!sci\|)/.test(trimmed)) {
    return "Marcação inválida. Use {{sci|nome científico}} para nomes científicos.";
  }

  for (const match of trimmed.matchAll(/\{\{sci\|([^}]*)\}\}/g)) {
    if (!match[1].trim()) {
      return "O nome científico não pode estar vazio.";
    }
  }

  return null;
}

export function normalizeStickerName(value: string | null | undefined): string {
  return (value?.trim() ?? "").slice(0, STICKER_NAME_MAX_LENGTH);
}
