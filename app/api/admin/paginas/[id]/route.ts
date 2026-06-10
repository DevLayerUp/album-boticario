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

  const update: Record<string, unknown> = {};
  if (title !== undefined)          update.title          = title ?? null;
  if (background_url !== undefined) update.background_url = background_url ?? null;
  if (page_number !== undefined) {
    if (!Number.isInteger(page_number) || page_number < 1) {
      return NextResponse.json({ error: "Número da página deve ser um inteiro ≥ 1" }, { status: 400 });
    }
    update.page_number = page_number;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("album_pages")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * PATCH /api/admin/paginas/[id]
 *
 * Works for both info pages and sticker pages:
 *
 * Info pages:
 *   { content?, background_url?, title? }
 *   → `content` is raw HTML
 *
 * Sticker pages (layout content via JSON):
 *   { layout_data?, title? }
 *   → `layout_data` is a JSON string (or object) stored in the `content` column
 *   → `title` is also synced to the top-level DB column for quick lookups
 *
 * Both variants can be combined in the same request body; the handler
 * accepts whichever fields are present.
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

  const {
    content,
    background_url,
    title,
    layout_data,   // ← for sticker pages: LayoutData object OR JSON string
  } = body as {
    content?: string;
    background_url?: string;
    title?: string;
    layout_data?: unknown;
  };

  const patch: Record<string, unknown> = {};

  // Info page fields
  if (content !== undefined)        patch.content        = content ?? null;
  if (background_url !== undefined) patch.background_url = background_url ?? null;
  if (title !== undefined)          patch.title          = title ?? null;

  // Sticker page layout data: serialise to JSON if an object was passed
  if (layout_data !== undefined) {
    if (layout_data === null) {
      patch.content = null;
    } else if (typeof layout_data === "string") {
      patch.content = layout_data || null;
    } else {
      patch.content = JSON.stringify(layout_data);
    }

    // Also sync the `title` column from layout_data.title when layout_data is provided
    if (
      typeof layout_data === "object" &&
      layout_data !== null &&
      "title" in layout_data &&
      title === undefined   // don't overwrite an explicit `title` field
    ) {
      patch.title = (layout_data as { title?: string }).title ?? null;
    }
  }

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
