import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import { isMissingAlbumPagePublicColumn } from "@/lib/album-page-visibility";
import { isMissingStickerPublicColumn } from "@/lib/sticker-visibility";

export type PublicContentFilters = {
  filterPublicPages: boolean;
  filterPublicStickers: boolean;
};

export const PUBLIC_CONTENT_FILTER_ATTEMPTS: PublicContentFilters[] = [
  { filterPublicPages: true, filterPublicStickers: true },
  { filterPublicPages: true, filterPublicStickers: false },
  { filterPublicPages: false, filterPublicStickers: true },
  { filterPublicPages: false, filterPublicStickers: false },
];

export function isMissingPublicContentColumn(
  error: { message?: string; code?: string } | null | undefined,
): boolean {
  return isMissingAlbumPagePublicColumn(error) || isMissingStickerPublicColumn(error);
}

export async function withPublicContentFilters<T>(
  run: (filters: PublicContentFilters) => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (const filters of PUBLIC_CONTENT_FILTER_ATTEMPTS) {
    try {
      return await run(filters);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const shaped =
        error && typeof error === "object"
          ? (error as { message?: string; code?: string })
          : { message };
      if (
        !isMissingPublicContentColumn(shaped) &&
        !isMissingPublicContentColumn({ message })
      ) {
        throw error;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function throwQueryError(error: { message: string; code?: string }): never {
  throw Object.assign(new Error(error.message), { code: error.code });
}

function applyAlbumSlotPublicFilters(
  query: any,
  filters: PublicContentFilters,
) {
  if (filters.filterPublicPages) query = query.eq("album_pages.is_public", true);
  if (filters.filterPublicStickers) query = query.eq("stickers.is_public", true);
  return query;
}

export function applyUserAlbumPublicFilters(
  query: any,
  filters: PublicContentFilters,
) {
  if (filters.filterPublicPages) query = query.eq("album_slots.album_pages.is_public", true);
  if (filters.filterPublicStickers) query = query.eq("album_slots.stickers.is_public", true);
  return query;
}

function albumSlotPublicSelect(base: string, filters: PublicContentFilters): string {
  let select = base;
  if (filters.filterPublicPages) select += ", album_pages!inner(is_public)";
  if (filters.filterPublicStickers) select += ", stickers!inner(is_public)";
  return select;
}

export function userAlbumSlotEmbed(fields: string, filters: PublicContentFilters): string {
  let embed = fields;
  if (filters.filterPublicPages) embed += ", album_pages!inner(is_public)";
  if (filters.filterPublicStickers) embed += ", stickers!inner(is_public)";
  return embed;
}

/** Slots de páginas/figurinhas públicas com figurinha cadastrada — únicos que contam no progresso. */
export async function countAssignedAlbumSlots(
  supabase: SupabaseClient,
): Promise<number> {
  return withPublicContentFilters(async (filters) => {
    let query: any = supabase.from("album_slots");
    query = query
      .select(albumSlotPublicSelect("id", filters), { count: "exact", head: true })
      .not("sticker_id", "is", null);
    const { count, error } = await applyAlbumSlotPublicFilters(query, filters);
    if (error) throwQueryError(error);
    return count ?? 0;
  });
}

/** Figurinhas coladas em slots públicos que têm figurinha cadastrada no admin. */
export async function countUserFilledAssignedSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  return withPublicContentFilters(async (filters) => {
    let query: any = supabase.from("user_album");
    query = query
      .select(
        `id, album_slots!inner(${userAlbumSlotEmbed("sticker_id", filters)})`,
        { count: "exact", head: true },
      )
      .eq("user_id", userId)
      .not("album_slots.sticker_id", "is", null);
    const { count, error } = await applyUserAlbumPublicFilters(query, filters);
    if (error) throwQueryError(error);
    return count ?? 0;
  });
}

export interface AssignedSlotByPage {
  id: number;
  page_id: number;
}

/** Slots atribuídos agrupáveis por página pública (missões de página completa). */
export async function loadAssignedAlbumSlotsByPage(
  supabase: SupabaseClient,
): Promise<AssignedSlotByPage[]> {
  return withPublicContentFilters((filters) =>
    fetchAllPages<AssignedSlotByPage>((from, to) => {
      let query: any = supabase.from("album_slots");
      query = query
        .select(albumSlotPublicSelect("id, page_id", filters))
        .not("sticker_id", "is", null)
        .range(from, to);
      return applyAlbumSlotPublicFilters(query, filters);
    }),
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
