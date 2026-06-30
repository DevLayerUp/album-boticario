import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  countUserTradeableSpares,
  userHasDuplicateStickers,
} from "@/lib/trade-duplicates";

/**
 * GET /api/trades/duplicates
 * Indica se o usuário tem figurinhas repetidas disponíveis para trocar.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [hasDuplicates, { duplicateTypes, extraCopies }] = await Promise.all([
    userHasDuplicateStickers(supabase, user.id),
    countUserTradeableSpares(supabase, user.id),
  ]);

  return NextResponse.json({
    hasDuplicates,
    duplicateTypes,
    extraCopies,
  });
}
