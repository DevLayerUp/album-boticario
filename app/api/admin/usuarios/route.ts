import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAdminUsuarios } from "@/lib/admin-usuarios-list";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const filterRaw = searchParams.get("filter");
  const filter =
    filterRaw === "sticker" || filterRaw === "no-sticker" ? filterRaw : "all";

  try {
    const supabase = createAdminClient();
    const result = await listAdminUsuarios(supabase, { page, search, filter });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar usuários" },
      { status: 500 },
    );
  }
}
