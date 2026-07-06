import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllAuthEmails } from "@/lib/admin-users";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import { formatBirthDateBR } from "@/lib/salesforce-lead";

export const dynamic = "force-dynamic";

interface ExportRow {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  city: string | null;
  state: string | null;
}

interface ProfileExportRow {
  id: string;
  display_name: string | null;
  birth_date: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
}

// Mesmos campos enviados ao Salesforce (CloudPage) + Telefone.
const COLUMNS: { header: string; value: (row: ExportRow) => unknown }[] = [
  { header: "Email", value: (r) => r.email },
  { header: "Name", value: (r) => r.display_name },
  { header: "DataNascimento", value: (r) => formatBirthDateBR(r.birth_date ?? undefined) },
  { header: "Estado", value: (r) => r.state },
  { header: "Cidade", value: (r) => r.city },
  { header: "Telefone", value: (r) => r.phone },
];

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\r\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();

  let profiles: ProfileExportRow[];
  let emailMap: Map<string, string | null>;

  try {
    [profiles, emailMap] = await Promise.all([
      fetchAllPages<ProfileExportRow>((from, to) =>
        supabase
          .from("profiles")
          .select("id, display_name, birth_date, city, state, phone")
          .order("created_at", { ascending: false })
          .range(from, to),
      ),
      fetchAllAuthEmails(supabase),
    ]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao exportar usuários" },
      { status: 500 },
    );
  }

  const rows: ExportRow[] = profiles.map((p) => ({
    display_name: p.display_name,
    email: emailMap.get(p.id) ?? null,
    phone: p.phone,
    birth_date: p.birth_date,
    city: p.city,
    state: p.state,
  }));

  const headerLine = COLUMNS.map((c) => csvCell(c.header)).join(",");
  const dataLines = rows.map((row) =>
    COLUMNS.map((c) => csvCell(c.value(row))).join(","),
  );
  // BOM para o Excel reconhecer UTF-8 (acentos)
  const csv = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  const filename = `usuarios-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Export-Row-Count": String(rows.length),
    },
  });
}
