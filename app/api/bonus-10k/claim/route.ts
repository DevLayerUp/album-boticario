import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPacksForUser } from "@/lib/pack";
import { checkRateLimit } from "@/lib/rate-limit";
import { BONUS_10K_PACK_SOURCE, BONUS_10K_SOURCE_REF } from "@/lib/bonus-10k";

/** POST /api/bonus-10k/claim — concede 1 pacote bônus (uma vez por usuário). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const rl = checkRateLimit(`bonus-10k:${user.id}`, 8, 15 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento." },
      { status: 429 },
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("packs")
    .select("id")
    .eq("user_id", user.id)
    .eq("source", BONUS_10K_PACK_SOURCE)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ claimed: true, already: true });
  }

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const result = await createPacksForUser(
    supabase,
    user.id,
    BONUS_10K_PACK_SOURCE,
    BONUS_10K_SOURCE_REF,
    1,
  );

  if (!result.success) {
    const admin = createAdminClient();
    const { data: raced } = await admin
      .from("packs")
      .select("id")
      .eq("user_id", user.id)
      .eq("source", BONUS_10K_PACK_SOURCE)
      .limit(1)
      .maybeSingle();

    if (raced) {
      return NextResponse.json({ claimed: true, already: true });
    }

    return NextResponse.json(
      { error: "Não foi possível criar o pacote. Tente novamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    claimed: true,
    packsCreated: result.packsCreated,
  });
}
