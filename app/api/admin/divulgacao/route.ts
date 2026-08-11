import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import {
  ADMIN_DIVULGACAO_PAGE_SIZE,
  listAdminDivulgacao,
} from "@/lib/admin-divulgacao";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * GET /api/admin/divulgacao
 * Colaboradores elegíveis ao programa, ordenados por convites válidos.
 */
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(
    searchParams.get("limit") ?? String(ADMIN_DIVULGACAO_PAGE_SIZE),
  );
  const search = searchParams.get("search") ?? undefined;

  try {
    const admin = createAdminClient();
    const result = await listAdminDivulgacao(admin, {
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : ADMIN_DIVULGACAO_PAGE_SIZE,
      search,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao carregar divulgação";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
