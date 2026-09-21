/** Concurso Cultural — Fãs por Natureza (dashboard, usuários logados). */

export const CONCURSO_ANSWER_MAX = 500;
export const CONCURSO_ANSWER_MIN = 40;

/** Início das inscrições (horário de Brasília). */
export const CONCURSO_START_ISO = "2026-09-21T00:00:00-03:00";
/** Encerramento do envio: 30/09/2026 às 23h59 BRT. */
export const CONCURSO_DEADLINE_ISO = "2026-09-30T23:59:59.999-03:00";

export const CONCURSO_REGULAMENTO_FALLBACK =
  "https://fundacaogrupoboticario.org.br/";

export function getConcursoRegulamentoUrl(override?: string): string {
  const fromOverride = override?.trim();
  if (fromOverride) return fromOverride;
  const url = process.env.NEXT_PUBLIC_CONCURSO_REGULAMENTO_URL?.trim();
  return url || CONCURSO_REGULAMENTO_FALLBACK;
}

export function getConcursoStart(): Date {
  return new Date(CONCURSO_START_ISO);
}

export function getConcursoDeadline(): Date {
  return new Date(CONCURSO_DEADLINE_ISO);
}

export function isConcursoOpen(now = new Date()): boolean {
  return now >= getConcursoStart() && now <= getConcursoDeadline();
}

export function getCpfDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatCpf(value: string): string {
  const digits = getCpfDigits(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function cpfCheckDigit(base: string, factor: number): number {
  let sum = 0;
  for (const char of base) {
    sum += Number(char) * factor;
    factor -= 1;
  }
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** CPF brasileiro com 11 dígitos e dígitos verificadores válidos. */
export function isValidCpf(value: string): boolean {
  const digits = getCpfDigits(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  const d1 = cpfCheckDigit(digits.slice(0, 9), 10);
  if (d1 !== Number(digits[9])) return false;
  const d2 = cpfCheckDigit(digits.slice(0, 10), 11);
  return d2 === Number(digits[10]);
}

export type ContestEntry = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  answer: string;
  created_at: string;
};
