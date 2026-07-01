import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

/** Sessão revogada, expirada ou cookie corrompido — precisa limpar e tratar como deslogado. */
export function isStaleAuthSessionError(error: AuthError | null | undefined): boolean {
  if (!error) return false;

  const message = error.message.toLowerCase();
  return (
    error.code === "refresh_token_not_found" ||
    message.includes("refresh token not found") ||
    message.includes("invalid refresh token") ||
    message.includes("refresh token already used")
  );
}

export async function clearStaleAuthSession(
  supabase: SupabaseClient,
  error: AuthError | null | undefined,
): Promise<void> {
  if (!isStaleAuthSessionError(error)) return;

  try {
    await supabase.auth.signOut();
  } catch {
    /* cookies já ausentes ou limpos */
  }
}

export async function getAuthUser(supabase: SupabaseClient): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (isStaleAuthSessionError(error)) {
    await clearStaleAuthSession(supabase, error);
    return { user: null, error: null };
  }

  return { user, error };
}
