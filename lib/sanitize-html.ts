/**
 * Sanitização básica de HTML para corpo de e-mails de campanha.
 * Remove tags perigosas e atributos de evento sem dependências externas.
 */

const BLOCKED_TAGS =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|button|meta|link|base|style)\b[^>]*>/gi;

const EVENT_HANDLERS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

const JS_URLS = /(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi;

export function sanitizeHtml(value: unknown, maxLength = 100_000): string {
  if (typeof value !== "string") return "";

  let html = value
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_URLS, '$1="#"')
    .trim()
    .slice(0, maxLength);

  return html;
}
