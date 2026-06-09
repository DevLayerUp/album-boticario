import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const body = await request.json();
  const { title, description, type, target_value, reward_packs, image_url, expires_at, is_active } =
    body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("missions")
    .update({
      title: title.trim(),
      description,
      type,
      target_value,
      reward_packs,
      image_url: image_url || null,
      expires_at: expires_at || null,
      is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("missions").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
