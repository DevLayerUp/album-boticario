import type { SupabaseClient } from "@supabase/supabase-js";
import { getCpfDigits } from "@/lib/concurso";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";

export const ADMIN_CONCURSO_PAGE_SIZE = 20;

const ENTRY_COLUMNS =
  "id, user_id, full_name, email, phone, cpf_digits, answer, accepted_rules, accepted_data, created_at";

export interface AdminContestEntry {
  id: number;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf_digits: string;
  answer: string;
  accepted_rules: boolean;
  accepted_data: boolean;
  created_at: string;
}

export interface AdminContestListResult {
  entries: AdminContestEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\,()]/g, (ch) => (ch === "," || ch === "(" || ch === ")" ? " " : `\\${ch}`));
}

function isMissingContestTable(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /contest_entries/i.test(error.message ?? "") &&
      /does not exist|schema cache|could not find/i.test(error.message ?? "")
  );
}

export async function listAdminContestEntries(
  admin: SupabaseClient,
  { page, search }: { page: number; search: string },
): Promise<AdminContestListResult> {
  const limit = ADMIN_CONCURSO_PAGE_SIZE;
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * limit;
  const to = from + limit - 1;
  const q = search.trim();

  let query = admin
    .from("contest_entries")
    .select(ENTRY_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    const escaped = escapeIlike(q);
    const digits = getCpfDigits(q);
    const filters = [
      `full_name.ilike.%${escaped}%`,
      `email.ilike.%${escaped}%`,
      `phone.ilike.%${escaped}%`,
      `answer.ilike.%${escaped}%`,
    ];
    if (digits.length >= 3) {
      filters.push(`cpf_digits.ilike.%${digits}%`);
    }
    query = query.or(filters.join(","));
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    if (isMissingContestTable(error)) {
      throw new Error(
        "A tabela de inscrições ainda não existe. Aplique a migration contest_entries.",
      );
    }
    throw new Error(error.message);
  }

  const total = count ?? 0;
  return {
    entries: (data ?? []) as AdminContestEntry[],
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** Todas as inscrições, da mais antiga para a mais recente, para a planilha. */
export async function listAllAdminContestEntries(
  admin: SupabaseClient,
): Promise<AdminContestEntry[]> {
  try {
    return await fetchAllPages<AdminContestEntry>((from, to) =>
      admin
        .from("contest_entries")
        .select(ENTRY_COLUMNS)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (isMissingContestTable({ message })) {
      throw new Error(
        "A tabela de inscrições ainda não existe. Aplique a migration contest_entries.",
      );
    }
    throw err;
  }
}
