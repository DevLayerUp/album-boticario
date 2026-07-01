import type { SupabaseClient } from "@supabase/supabase-js";

export function isAdminRole(
  appMetadata?: Record<string, unknown> | null,
  userMetadata?: Record<string, unknown> | null,
): boolean {
  const role =
    (appMetadata?.role as string | undefined) ??
    (userMetadata?.role as string | undefined);
  return role === "admin";
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
