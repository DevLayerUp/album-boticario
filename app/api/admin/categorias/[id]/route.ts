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
  const { name, description, cover_image, sort_order } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sticker_categories")
    .update({ name: name.trim(), description, cover_image, sort_order })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();

  // Check for linked stickers
  const { count } = await supabase
    .from("stickers")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir categoria com figurinhas vinculadas" },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("sticker_categories")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
