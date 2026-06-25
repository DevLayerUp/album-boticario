import type { SupabaseClient } from "@supabase/supabase-js";

export const NO_DUPLICATES_TRADE_MESSAGE =
  "Você precisa de figurinhas repetidas para trocar. Abra pacotinhos ou complete missões para conseguir mais cópias.";

export async function userHasDuplicateStickers(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("user_stickers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gt("quantity", 1);

  if (error) return false;
  return (count ?? 0) > 0;
}
