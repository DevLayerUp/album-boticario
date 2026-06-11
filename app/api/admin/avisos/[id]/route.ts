import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeId, sanitizeText } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = sanitizeText(body.title, 120);
    if (!title) return NextResponse.json({ error: "Título inválido" }, { status: 400 });
    updates.title = title;
  }
  if (body.body !== undefined) {
    const text = sanitizeText(body.body, 500);
    if (!text) return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    updates.body = text;
  }
  if (body.href !== undefined) updates.href = sanitizeText(body.href, 200) || null;
  if (body.is_active !== undefined) updates.is_active = !!body.is_active;
  if (body.expires_at !== undefined) updates.expires_at = body.expires_at || null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
