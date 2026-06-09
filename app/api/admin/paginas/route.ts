import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminGuard } from "@/lib/admin-guard";
import { TEMPLATE_MAP, type TemplateId } from "@/lib/album-templates";

/**
 * GET /api/admin/paginas?category_id=1
 * List all album pages (optionally filtered by category).
 */
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");

  let query = supabase
    .from("album_pages")
    .select(
      `id, page_number, title, background_url, layout_template, category_id,
       sticker_categories (id, name),
       album_slots (id, slot_number, sticker_id)`
    )
    .order("category_id")
    .order("page_number");

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/**
 * POST /api/admin/paginas
 * Create a new album page.
 * - page_type "sticker" (default): requires layout_template, auto-generates slots.
 * - page_type "info": no template needed, no slots; stores HTML content.
 * Body: { category_id, page_number, title?, background_url?, layout_template?, page_type?, content? }
 */
export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const body = await request.json().catch(() => ({}));
  const {
    category_id,
    page_number,
    title,
    background_url,
    layout_template,
    page_type = "sticker",
    content,
  } = body as {
    category_id?: number;
    page_number?: number;
    title?: string;
    background_url?: string;
    layout_template?: string;
    page_type?: string;
    content?: string;
  };

  if (!category_id || !page_number) {
    return NextResponse.json(
      { error: "category_id e page_number são obrigatórios" },
      { status: 400 }
    );
  }

  // Sticker pages require a valid template
  if (page_type !== "info") {
    if (!layout_template) {
      return NextResponse.json({ error: "layout_template obrigatório para páginas de figurinha" }, { status: 400 });
    }
    const template = TEMPLATE_MAP[layout_template as TemplateId];
    if (!template) {
      return NextResponse.json({ error: "Template inválido" }, { status: 400 });
    }

    // 1. Create the page
    const { data: page, error: pageErr } = await supabase
      .from("album_pages")
      .insert({
        category_id,
        page_number,
        title: title ?? null,
        background_url: background_url ?? null,
        layout_template,
        page_type: "sticker",
      })
      .select()
      .single();

    if (pageErr) return NextResponse.json({ error: pageErr.message }, { status: 500 });

    // 2. Auto-generate slots (cols × rows)
    const slots = Array.from({ length: template.total }, (_, i) => ({
      page_id: page.id,
      slot_number: i + 1,
      position_x: ((i % template.cols) / template.cols) * 100,
      position_y: (Math.floor(i / template.cols) / template.rows) * 100,
    }));

    const { error: slotsErr } = await supabase.from("album_slots").insert(slots);
    if (slotsErr) return NextResponse.json({ error: slotsErr.message }, { status: 500 });

    return NextResponse.json(page, { status: 201 });
  }

  // Info page — no slots, just content
  const { data: page, error: pageErr } = await supabase
    .from("album_pages")
    .insert({
      category_id,
      page_number,
      title: title ?? null,
      background_url: background_url ?? null,
      layout_template: layout_template ?? "info",
      page_type: "info",
      content: content ?? null,
    })
    .select()
    .single();

  if (pageErr) return NextResponse.json({ error: pageErr.message }, { status: 500 });
  return NextResponse.json(page, { status: 201 });
}
