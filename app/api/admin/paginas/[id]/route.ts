import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminGuard } from "@/lib/admin-guard";

/**
 * DELETE /api/admin/paginas/[id]
 * Deletes a page and all its slots (cascade via FK).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("album_pages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

/**
 * PUT /api/admin/paginas/[id]
 * Update title, background_url, or page_number.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json().catch(() => ({}));
  const { title, background_url, page_number } = body as {
    title?: string;
    background_url?: string;
    page_number?: number;
  };

  const { data, error } = await supabase
    .from("album_pages")
    .update({ title: title ?? null, background_url: background_url ?? null, ...(page_number ? { page_number } : {}) })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * PATCH /api/admin/paginas/[id]
 * Update content and/or background_url for info pages.
 * Body: { content?, background_url?, title? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json().catch(() => ({}));
  const { content, background_url, title } = body as {
    content?: string;
    background_url?: string;
    title?: string;
  };

  const patch: Record<string, unknown> = {};
  if (content !== undefined)        patch.content        = content ?? null;
  if (background_url !== undefined) patch.background_url = background_url ?? null;
  if (title !== undefined)          patch.title          = title ?? null;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("album_pages")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
