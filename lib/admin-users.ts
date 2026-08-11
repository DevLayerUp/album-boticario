import type { SupabaseClient, User } from "@supabase/supabase-js";

export function isAdminRole(
  appMetadata?: Record<string, unknown> | null,
  userMetadata?: Record<string, unknown> | null,
): boolean {
  const role =
    (appMetadata?.role as string | undefined) ??
    (userMetadata?.role as string | undefined);
  return role === "admin";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Resolve o e-mail de contato do usuário no Auth — inclui login social (Google, Apple, etc.).
 * O campo `user.email` pode vir vazio mesmo com identidade OAuth válida.
 */
export function resolveAuthUserEmail(
  user: Pick<User, "email" | "user_metadata" | "identities"> | null | undefined,
): string | null {
  if (!user) return null;

  const candidates: Array<string | null | undefined> = [user.email];

  const metadata = user.user_metadata ?? {};
  if (typeof metadata.email === "string") candidates.push(metadata.email);
  if (typeof metadata.preferred_username === "string") {
    candidates.push(metadata.preferred_username);
  }

  for (const identity of user.identities ?? []) {
    const data = identity.identity_data as Record<string, unknown> | undefined;
    if (typeof data?.email === "string") candidates.push(data.email);
  }

  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (normalized && isValidEmail(normalized)) {
      return normalized;
    }
  }

  return null;
}

/** IDs de contas com role admin (não devem aparecer no ranking público). */
export async function listAdminUserIds(
  admin: SupabaseClient,
): Promise<Set<string>> {
  const ids = new Set<string>();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const authUser of data.users) {
      if (isAdminRole(authUser.app_metadata, authUser.user_metadata)) {
        ids.add(authUser.id);
      }
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return ids;
}

/** Mapa user_id → e-mail de todos os usuários em auth (paginação completa). */
export async function fetchAllAuthEmails(
  admin: SupabaseClient,
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      map.set(user.id, resolveAuthUserEmail(user));
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return map;
}

/** E-mails de usuários específicos — usa getUserById (preciso para OAuth e feedback). */
export async function fetchAuthEmailsForUserIds(
  admin: SupabaseClient,
  userIds: string[],
): Promise<Map<string, string | null>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, string | null>();
  if (unique.length === 0) return map;

  const results = await Promise.all(
    unique.map(async (userId) => {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error || !data.user) return [userId, null] as const;
      return [userId, resolveAuthUserEmail(data.user)] as const;
    }),
  );

  for (const [userId, email] of results) {
    map.set(userId, email);
  }

  return map;
}
