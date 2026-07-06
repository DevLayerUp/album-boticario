import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";

/** Slots com figurinha cadastrada no admin — únicos que contam para progresso do álbum. */
export async function countAssignedAlbumSlots(
  supabase: SupabaseClient,
): Promise<number> {
  const { count, error } = await supabase
    .from("album_slots")
    .select("id", { count: "exact", head: true })
    .not("sticker_id", "is", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Figurinhas coladas em slots que têm figurinha cadastrada no admin. */
export async function countUserFilledAssignedSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("user_album")
    .select("id, album_slots!inner(sticker_id)", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("album_slots.sticker_id", "is", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export interface AssignedSlotByPage {
  id: number;
  page_id: number;
}

/** Slots atribuídos agrupáveis por página (missões de página completa). */
export async function loadAssignedAlbumSlotsByPage(
  supabase: SupabaseClient,
): Promise<AssignedSlotByPage[]> {
  return fetchAllPages<AssignedSlotByPage>((from, to) =>
    supabase
      .from("album_slots")
      .select("id, page_id")
      .not("sticker_id", "is", null)
      .range(from, to),
  );
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
