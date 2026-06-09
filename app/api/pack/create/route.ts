import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPacksForUser } from "@/lib/pack";

/**
 * POST /api/pack/create
 * Internal endpoint called after quiz correct answer or mission claim.
 * Body: { source, source_ref, quantity? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { source = "manual", source_ref = "", quantity = 1 } = body as {
    source?: string;
    source_ref?: string;
    quantity?: number;
  };

  const result = await createPacksForUser(
    supabase,
    user.id,
    source,
    String(source_ref),
    Math.min(quantity, 10) // safety cap
  );

  if (!result.success) {
    return NextResponse.json(
      { error: "Figurinhas não cadastradas. Adicione figurinhas e raridades no admin." },
      { status: 422 }
    );
  }

  return NextResponse.json({ success: true, packs_created: result.packsCreated });
}
