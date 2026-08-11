import type { User } from "@supabase/supabase-js";
import { resolveAuthUserEmail } from "@/lib/admin-users";

/** Domínios de e-mail que liberam a missão de divulgação para colaboradores. */
export const COLLABORATOR_EMAIL_DOMAINS = [
  "grupoboticario.com.br",
  "fundacaogrupoboticario.org.br",
] as const;

export function isCollaboratorEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 0) return false;
  const domain = normalized.slice(at + 1);
  return (COLLABORATOR_EMAIL_DOMAINS as readonly string[]).includes(domain);
}

/** Colaborador elegível — resolve e-mail Auth (inclui OAuth). */
export function isCollaboratorAuthUser(
  user: Pick<User, "email" | "user_metadata" | "identities"> | null | undefined,
): boolean {
  return isCollaboratorEmail(resolveAuthUserEmail(user));
}
