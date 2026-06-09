import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const hasSticker = searchParams.get("has_sticker");

  const supabase = createAdminClient();
  let query = supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      username,
      sticker_url,
      created_at,
      users:id ( email )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
  }
  if (hasSticker === "true") query = query.not("sticker_url", "is", null);
  if (hasSticker === "false") query = query.is("sticker_url", null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch emails from auth.users separately (service role gives access)
  const ids = (data ?? []).map((p) => p.id);
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? []).map((u) => [u.id, u.email]),
  );

  const enriched = (data ?? []).map((p) => ({
    ...p,
    email: emailMap[p.id] ?? null,
  }));

  return NextResponse.json(enriched);
}
