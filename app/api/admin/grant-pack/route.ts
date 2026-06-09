import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPacksForUser } from "@/lib/pack";

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json();
  const { user_id, quantity, reason } = body;

  if (!user_id) {
    return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 });
  }
  const qty = Math.max(1, Math.min(Number(quantity) || 1, 50));

  const supabase = createAdminClient();

  // Create packs WITH stickers generated (uses rarity drop_percentage)
  const result = await createPacksForUser(
    supabase,
    user_id,
    "admin_grant",
    reason ?? "",
    qty
  );

  if (!result.success) {
    // Fallback: create empty packs if no stickers exist yet
    const rows = Array.from({ length: qty }, () => ({
      user_id,
      source: "admin_grant",
      source_ref: reason ?? null,
    }));
    const { error } = await supabase.from("packs").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ granted: qty, warning: "Packs criados sem figurinhas — cadastre figurinhas e raridades no admin." });
  }

  return NextResponse.json({ granted: result.packsCreated });
}
