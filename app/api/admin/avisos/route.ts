import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeText } from "@/lib/sanitize";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json().catch(() => ({}));
  const title = sanitizeText(body.title, 120);
  const announcementBody = sanitizeText(body.body, 500);
  const href = sanitizeText(body.href, 200) || null;
  const is_active = body.is_active !== false;
  const expires_at = body.expires_at || null;

  if (!title || !announcementBody) {
    return NextResponse.json(
      { error: "Título e mensagem são obrigatórios" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({ title, body: announcementBody, href, is_active, expires_at })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
