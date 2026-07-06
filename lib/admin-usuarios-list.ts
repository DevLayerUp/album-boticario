import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminRole } from "@/lib/admin-users";

export const ADMIN_USUARIOS_PAGE_SIZE = 100;

export interface AdminUsuarioRow {
  id: string;
  display_name: string | null;
  username: string | null;
  sticker_url: string | null;
  created_at: string;
  email: string | null;
  is_admin: boolean;
}

export interface AdminUsuariosListResult {
  users: AdminUsuarioRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function findUserIdsByEmailSearch(
  admin: SupabaseClient,
  query: string,
): Promise<string[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const ids: string[] = [];
  let page = 1;

  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      if (user.email?.toLowerCase().includes(q)) {
        ids.push(user.id);
      }
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return ids;
}

async function getAuthInfoForUserIds(
  admin: SupabaseClient,
  userIds: string[],
): Promise<Map<string, { email: string | null; is_admin: boolean }>> {
  const pending = new Set(userIds);
  const map = new Map<string, { email: string | null; is_admin: boolean }>();
  if (!pending.size) return map;

  let page = 1;
  while (pending.size > 0 && page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      if (!pending.has(user.id)) continue;
      map.set(user.id, {
        email: user.email ?? null,
        is_admin: isAdminRole(user.app_metadata, user.user_metadata),
      });
      pending.delete(user.id);
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return map;
}

export async function listAdminUsuarios(
  admin: SupabaseClient,
  options: {
    page?: number;
    search?: string;
    filter?: "all" | "sticker" | "no-sticker";
  } = {},
): Promise<AdminUsuariosListResult> {
  const page = Math.max(1, options.page ?? 1);
  const limit = ADMIN_USUARIOS_PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const search = options.search?.trim() ?? "";
  const filter = options.filter ?? "all";

  let query = admin
    .from("profiles")
    .select("id, display_name, username, sticker_url, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (filter === "sticker") {
    query = query.not("sticker_url", "is", null);
  } else if (filter === "no-sticker") {
    query = query.is("sticker_url", null);
  }

  if (search) {
    const escaped = escapeIlike(search);
    const emailIds = await findUserIdsByEmailSearch(admin, search);

    if (emailIds.length > 0) {
      query = query.or(
        `display_name.ilike.%${escaped}%,username.ilike.%${escaped}%,id.in.(${emailIds.join(",")})`,
      );
    } else {
      query = query.or(
        `display_name.ilike.%${escaped}%,username.ilike.%${escaped}%`,
      );
    }
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const profiles = data ?? [];
  const authMap = await getAuthInfoForUserIds(
    admin,
    profiles.map((p) => p.id),
  );

  const users: AdminUsuarioRow[] = profiles.map((p) => {
    const auth = authMap.get(p.id);
    return {
      id: p.id,
      display_name: p.display_name,
      username: p.username,
      sticker_url: p.sticker_url,
      created_at: p.created_at,
      email: auth?.email ?? null,
      is_admin: auth?.is_admin ?? false,
    };
  });

  const total = count ?? 0;

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
