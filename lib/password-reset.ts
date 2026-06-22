/** Caminho da página onde o usuário define a nova senha após o e-mail. */
export const REDEFINIR_SENHA_PATH = "/redefinir-senha";

/** Monta a URL de callback usada em `resetPasswordForEmail`. */
export function buildPasswordResetRedirectUrl(origin: string): string {
  const next = encodeURIComponent(REDEFINIR_SENHA_PATH);
  return `${origin}/auth/callback?next=${next}`;
}
