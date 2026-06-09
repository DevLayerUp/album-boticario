import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PaginasClient } from "./paginas-client";

export const metadata: Metadata = { title: "Páginas do Álbum" };
export const dynamic = "force-dynamic";

export default async function PaginasPage() {
  const supabase = createAdminClient();

  const [{ data: categories }, { data: pages }] = await Promise.all([
    supabase
      .from("sticker_categories")
      .select("id, name")
      .order("sort_order"),
    supabase
      .from("album_pages")
      .select(
        `id, page_number, title, background_url, layout_template, category_id,
         page_type, content,
         album_slots (id)`
      )
      .order("category_id")
      .order("page_number"),
  ]);

  // Count slots per page
  const pagesWithCount = (pages ?? []).map((p) => ({
    id: p.id as number,
    page_number: p.page_number as number,
    title: (p.title ?? null) as string | null,
    background_url: (p.background_url ?? null) as string | null,
    layout_template: (p.layout_template ?? "3x3") as string,
    category_id: p.category_id as number,
    slot_count: Array.isArray(p.album_slots) ? p.album_slots.length : 0,
    page_type: ((p.page_type as string) ?? "sticker") as "sticker" | "info",
    content: (p.content ?? null) as string | null,
  }));

  return (
    <PaginasClient
      initialCategories={categories ?? []}
      initialPages={pagesWithCount}
    />
  );
}
