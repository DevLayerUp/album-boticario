import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { userHasDuplicateStickers } from "@/lib/trade-duplicates";

/**
 * GET /api/trades/duplicates
 * Indica se o usuário tem figurinhas repetidas (quantity > 1) para trocar.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_stickers")
    .select("sticker_id, quantity")
    .eq("user_id", user.id)
    .gt("quantity", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const duplicateTypes = rows.length;
  const extraCopies = rows.reduce((acc, row) => acc + (row.quantity - 1), 0);
  const hasDuplicates = await userHasDuplicateStickers(supabase, user.id);

  return NextResponse.json({
    hasDuplicates,
    duplicateTypes,
    extraCopies,
  });
}
