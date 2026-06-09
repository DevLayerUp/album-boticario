/**
 * Lightweight server-side sanitization utilities.
 * No external dependencies needed for these basic cases.
 */

/** Strip HTML tags and normalize whitespace. */
export function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")   // strip HTML
    .replace(/[<>]/g, "")      // remove stray angle brackets
    .trim()
    .slice(0, maxLength);
}

/** Ensure a value is a positive integer or null. */
export function sanitizeId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Ensure a value is a valid UUID or null. */
export function sanitizeUuid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRe.test(value) ? value : null;
}
