import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminGuard } from "@/lib/admin-guard";
import { TEMPLATE_MAP, type TemplateId } from "@/lib/album-templates";
import type { SupabaseClient } from "@supabase/supabase-js";

async function reconcilePageSlots(
  supabase: SupabaseClient,
  pageId: number,
  templateId: TemplateId,
) {
  const template = TEMPLATE_MAP[templateId];
  if (!template) {
    return { error: "Template inválido" as const };
  }

  const newTotal = template.total;

  if (newTotal === 0) {
    const { error } = await supabase.from("album_slots").delete().eq("page_id", pageId);
    if (error) return { error: error.message };
    return { slot_count: 0 };
  }

  const { error: deleteError } = await supabase
    .from("album_slots")
    .delete()
    .eq("page_id", pageId)
    .gt("slot_number", newTotal);

  if (deleteError) return { error: deleteError.message };

  const { data: remaining, error: fetchError } = await supabase
    .from("album_slots")
    .select("slot_number")
    .eq("page_id", pageId)
    .order("slot_number");

  if (fetchError) return { error: fetchError.message };

  const maxSlot = remaining?.length
    ? Math.max(...remaining.map((s) => s.slot_number))
    : 0;

  if (maxSlot < newTotal) {
    const slots = Array.from({ length: newTotal - maxSlot }, (_, offset) => {
      const i = maxSlot + offset;
      return {
        page_id: pageId,
        slot_number: i + 1,
        position_x: ((i % template.cols) / template.cols) * 100,
        position_y: (Math.floor(i / template.cols) / template.rows) * 100,
      };
    });

    const { error: insertError } = await supabase.from("album_slots").insert(slots);
    if (insertError) return { error: insertError.message };
  }

  return { slot_count: newTotal };
}

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
 *   { layout_data?, title?, layout_template? }
 *   → `layout_data` is a JSON string (or object) stored in the `content` column
 *   → `layout_template` reconciles catalog slots (add/remove) for existing sticker pages
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
    layout_template,
  } = body as {
    content?: string;
    background_url?: string;
    title?: string;
    layout_data?: unknown;
    layout_template?: string;
  };

  const patch: Record<string, unknown> = {};
  let slotCount: number | undefined;

  if (layout_template !== undefined) {
    const template = TEMPLATE_MAP[layout_template as TemplateId];
    if (!template) {
      return NextResponse.json({ error: "Template inválido" }, { status: 400 });
    }

    const { data: page, error: pageError } = await supabase
      .from("album_pages")
      .select("page_type, layout_template")
      .eq("id", id)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
    }
    if (page.page_type !== "sticker") {
      return NextResponse.json(
        { error: "Só é possível alterar o template de páginas de figurinhas" },
        { status: 400 },
      );
    }
    if (page.layout_template !== layout_template) {
      const reconciled = await reconcilePageSlots(supabase, Number(id), layout_template as TemplateId);
      if ("error" in reconciled) {
        return NextResponse.json({ error: reconciled.error }, { status: 500 });
      }
      slotCount = reconciled.slot_count;
    } else {
      slotCount = template.total;
    }

    patch.layout_template = layout_template;
  }

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
  return NextResponse.json({
    ...data,
    ...(slotCount !== undefined ? { slot_count: slotCount } : {}),
  });
}
