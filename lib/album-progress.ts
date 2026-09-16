import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import { isMissingAlbumPagePublicColumn } from "@/lib/album-page-visibility";

/** Slots de páginas públicas com figurinha cadastrada — únicos que contam no progresso. */
export async function countAssignedAlbumSlots(
  supabase: SupabaseClient,
): Promise<number> {
  const { count, error } = await supabase
    .from("album_slots")
    .select("id, album_pages!inner(is_public)", { count: "exact", head: true })
    .eq("album_pages.is_public", true)
    .not("sticker_id", "is", null);

  if (error && isMissingAlbumPagePublicColumn(error)) {
    const fallback = await supabase
      .from("album_slots")
      .select("id", { count: "exact", head: true })
      .not("sticker_id", "is", null);
    if (fallback.error) throw new Error(fallback.error.message);
    return fallback.count ?? 0;
  }

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Figurinhas coladas em slots públicos que têm figurinha cadastrada no admin. */
export async function countUserFilledAssignedSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("user_album")
    .select("id, album_slots!inner(sticker_id, album_pages!inner(is_public))", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .not("album_slots.sticker_id", "is", null)
    .eq("album_slots.album_pages.is_public", true);

  if (error && isMissingAlbumPagePublicColumn(error)) {
    const fallback = await supabase
      .from("user_album")
      .select("id, album_slots!inner(sticker_id)", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("album_slots.sticker_id", "is", null);
    if (fallback.error) throw new Error(fallback.error.message);
    return fallback.count ?? 0;
  }

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export interface AssignedSlotByPage {
  id: number;
  page_id: number;
}

/** Slots atribuídos agrupáveis por página pública (missões de página completa). */
export async function loadAssignedAlbumSlotsByPage(
  supabase: SupabaseClient,
): Promise<AssignedSlotByPage[]> {
  return fetchAllPages<AssignedSlotByPage>((from, to) =>
    supabase
      .from("album_slots")
      .select("id, page_id, album_pages!inner(is_public)")
      .eq("album_pages.is_public", true)
      .not("sticker_id", "is", null)
      .range(from, to),
  ).catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    if (!isMissingAlbumPagePublicColumn({ message })) throw error;
    return fetchAllPages<AssignedSlotByPage>((from, to) =>
      supabase
        .from("album_slots")
        .select("id, page_id")
        .not("sticker_id", "is", null)
        .range(from, to),
    );
  });
}

export function buildSlotsByPage(
  slots: AssignedSlotByPage[],
): Map<number, number> {
  const slotsByPage = new Map<number, number>();
  for (const slot of slots) {
    slotsByPage.set(slot.page_id, (slotsByPage.get(slot.page_id) ?? 0) + 1);
  }
  return slotsByPage;
}
