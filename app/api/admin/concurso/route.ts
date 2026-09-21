import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAdminContestEntries } from "@/lib/admin-concurso-list";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";

  try {
    const supabase = createAdminClient();
    const result = await listAdminContestEntries(supabase, { page, search });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[admin/concurso] list:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar inscrições" },
      { status: 500 },
    );
  }
}
