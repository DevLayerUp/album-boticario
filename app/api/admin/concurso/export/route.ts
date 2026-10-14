import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { listAllAdminContestEntries } from "@/lib/admin-concurso-list";
import { contestEntriesToCsv, contestExportFilename } from "@/lib/concurso-export";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const supabase = createAdminClient();
    const entries = await listAllAdminContestEntries(supabase);
    const csv = contestEntriesToCsv(entries);
    const filename = contestExportFilename();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Export-Row-Count": String(entries.length),
      },
    });
  } catch (err) {
    console.error("[admin/concurso] export:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao exportar respostas" },
      { status: 500 },
    );
  }
}
