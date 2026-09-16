import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingAlbumPagePublicColumn } from "@/lib/album-page-visibility";
import { PaginasClient } from "./paginas-client";

export const metadata: Metadata = { title: "Páginas do Álbum" };
export const dynamic = "force-dynamic";

export default async function PaginasPage() {
  const supabase = createAdminClient();

  const [{ data: categories }, pagesRes] = await Promise.all([
    supabase
      .from("sticker_categories")
      .select("id, name")
      .order("sort_order"),
    supabase
      .from("album_pages")
      .select(
        `id, page_number, title, background_url, layout_template, category_id,
         page_type, content, is_public,
         album_slots (id, sticker_id)`
      )
      .order("category_id")
      .order("page_number"),
  ]);

  let pages = pagesRes.data;
  if (pagesRes.error && isMissingAlbumPagePublicColumn(pagesRes.error)) {
    const fallback = await supabase
      .from("album_pages")
      .select(
        `id, page_number, title, background_url, layout_template, category_id,
         page_type, content,
         album_slots (id, sticker_id)`
      )
      .order("category_id")
      .order("page_number");
    pages = fallback.data;
  }

  // Count slots per page
  const pagesWithCount = (pages ?? []).map((p) => {
    const slots = Array.isArray(p.album_slots) ? p.album_slots : [];
    const assignedSlotCount = slots.filter(
      (slot) => (slot as { sticker_id: number | null }).sticker_id != null,
    ).length;

    return {
    id: p.id as number,
    page_number: p.page_number as number,
    title: (p.title ?? null) as string | null,
    background_url: (p.background_url ?? null) as string | null,
    layout_template: (p.layout_template ?? "3x3") as string,
    category_id: p.category_id as number,
    slot_count: slots.length,
    assigned_slot_count: assignedSlotCount,
    page_type: ((p.page_type as string) ?? "sticker") as "sticker" | "info",
    content: (p.content ?? null) as string | null,
    is_public: (p as { is_public?: boolean | null }).is_public !== false,
  };
  });

  return (
    <PaginasClient
      initialCategories={categories ?? []}
      initialPages={pagesWithCount}
    />
  );
}
