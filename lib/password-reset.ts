/** Caminho da página onde o usuário define a nova senha após o e-mail. */
export const REDEFINIR_SENHA_PATH = "/redefinir-senha";

/** URL amigável enviada no e-mail de recuperação (domínio do app, não Supabase). */
export function buildPasswordRecoveryEmailUrl(
  origin: string,
  tokenHash: string,
): string {
  const base = origin.replace(/\/$/, "");
  const params = new URLSearchParams({ token: tokenHash });
  return `${base}/auth/recuperar-senha?${params.toString()}`;
}

/** @deprecated Usado apenas se o fluxo passar pelo callback com ?code= */
export function buildPasswordResetRedirectUrl(origin: string): string {
  const next = encodeURIComponent(REDEFINIR_SENHA_PATH);
  return `${origin}/auth/callback?next=${next}`;
}
