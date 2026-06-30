/**
 * Utilitários de telefone no padrão brasileiro.
 * Formatos aceitos:
 *  - Fixo:    (00) 0000-0000  → 10 dígitos
 *  - Celular: (00) 00000-0000 → 11 dígitos
 */

/** Mantém só os dígitos do valor informado. */
export function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Aplica a máscara conforme o usuário digita (fixo ou celular). */
export function formatPhoneBR(value: string): string {
  const digits = getPhoneDigits(value).slice(0, 11);
  const len = digits.length;

  if (len === 0) return "";
  if (len <= 2) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Verdadeiro quando o telefone tem 10 (fixo) ou 11 (celular) dígitos. */
export function isValidPhoneBR(value: string): boolean {
  const len = getPhoneDigits(value).length;
  return len === 10 || len === 11;
}
