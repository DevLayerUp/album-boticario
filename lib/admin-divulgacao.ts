import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAuthUserEmail } from "@/lib/admin-users";
import {
  countAmbassadorCompleteReferrals,
  countAmbassadorSignups,
  getAmbassadorProgramStartedAt,
} from "@/lib/ambassador-program";
import { isCollaboratorEmail } from "@/lib/collaborator";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";

export const ADMIN_DIVULGACAO_PAGE_SIZE = 25;

export interface AdminDivulgacaoRow {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
  sticker_url: string | null;
  referral_code: string | null;
  /** Indicados com cadastro completo (contam no programa). */
  complete_invites: number;
  /** Indicados que criaram conta (ainda sem perfil completo). */
  total_signups: number;
}

export interface AdminDivulgacaoListResult {
  collaborators: AdminDivulgacaoRow[];
  summary: {
    collaborator_count: number;
    total_complete_invites: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CollaboratorAuthRow {
  id: string;
  email: string;
}

async function listCollaboratorAuthUsers(
  admin: SupabaseClient,
): Promise<CollaboratorAuthRow[]> {
  const collaborators: CollaboratorAuthRow[] = [];
  let page = 1;

  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      const email = resolveAuthUserEmail(user);
      if (!isCollaboratorEmail(email) || !email) continue;
      collaborators.push({ id: user.id, email });
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return collaborators;
}

export async function listAdminDivulgacao(
  admin: SupabaseClient,
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {},
): Promise<AdminDivulgacaoListResult> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(
    100,
    Math.max(1, options.limit ?? ADMIN_DIVULGACAO_PAGE_SIZE),
  );
  const search = options.search?.trim().toLowerCase() ?? "";

  const collaborators = await listCollaboratorAuthUsers(admin);
  const collaboratorIds = new Set(collaborators.map((row) => row.id));

  const collaboratorIdList = [...collaboratorIds];

  const [profiles, referredProfiles, programStartedAt] = await Promise.all([
    (async () => {
      if (collaboratorIdList.length === 0) return [];
      const chunks: Array<{
        id: string;
        display_name: string | null;
        username: string | null;
        sticker_url: string | null;
        referral_code: string | null;
      }> = [];
      const chunkSize = 100;
      for (let i = 0; i < collaboratorIdList.length; i += chunkSize) {
        const slice = collaboratorIdList.slice(i, i + chunkSize);
        const { data, error } = await admin
          .from("profiles")
          .select("id, display_name, username, sticker_url, referral_code")
          .in("id", slice);
        if (error) throw new Error(error.message);
        chunks.push(...(data ?? []));
      }
      return chunks;
    })(),
    fetchAllPages<{
      referred_by: string;
      created_at: string;
      display_name: string | null;
      bio: string | null;
      phone: string | null;
      city: string | null;
      state: string | null;
      avatar_url: string | null;
      sticker_url: string | null;
    }>((from, to) =>
      admin
        .from("profiles")
        .select(
          "referred_by, created_at, display_name, bio, phone, city, state, avatar_url, sticker_url",
        )
        .not("referred_by", "is", null)
        .range(from, to),
    ),
    getAmbassadorProgramStartedAt(admin),
  ]);

  const profileById = new Map(profiles.map((row) => [row.id, row]));

  const referredByCollaborator = new Map<
    string,
    Array<{
      created_at: string;
      display_name: string | null;
      bio: string | null;
      phone: string | null;
      city: string | null;
      state: string | null;
      avatar_url: string | null;
      sticker_url: string | null;
    }>
  >();

  for (const referred of referredProfiles) {
    if (!collaboratorIds.has(referred.referred_by)) continue;
    const list = referredByCollaborator.get(referred.referred_by) ?? [];
    list.push(referred);
    referredByCollaborator.set(referred.referred_by, list);
  }

  let rows: AdminDivulgacaoRow[] = collaborators.map((auth) => {
    const profile = profileById.get(auth.id);
    const referred = referredByCollaborator.get(auth.id) ?? [];
    return {
      id: auth.id,
      email: auth.email,
      display_name: profile?.display_name ?? null,
      username: profile?.username ?? null,
      sticker_url: profile?.sticker_url ?? null,
      referral_code: profile?.referral_code ?? null,
      complete_invites: countAmbassadorCompleteReferrals(
        referred,
        programStartedAt,
      ),
      total_signups: countAmbassadorSignups(referred, programStartedAt),
    };
  });

  const totalCompleteInvites = rows.reduce(
    (sum, row) => sum + row.complete_invites,
    0,
  );

  if (search) {
    rows = rows.filter((row) => {
      const haystack = [
        row.email,
        row.display_name ?? "",
        row.username ?? "",
        row.referral_code ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  rows.sort((a, b) => {
    if (b.complete_invites !== a.complete_invites) {
      return b.complete_invites - a.complete_invites;
    }
    if (b.total_signups !== a.total_signups) {
      return b.total_signups - a.total_signups;
    }
    return a.email.localeCompare(b.email, "pt-BR");
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;
  const pageRows = rows.slice(offset, offset + limit);

  return {
    collaborators: pageRows,
    summary: {
      collaborator_count: collaborators.length,
      total_complete_invites: totalCompleteInvites,
    },
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}
