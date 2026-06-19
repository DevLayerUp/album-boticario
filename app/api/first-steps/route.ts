import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  FIRST_STEPS_CONFIG_KEY,
  parseFirstStepsConfig,
} from "@/lib/first-steps";

/** GET /api/first-steps — configuração pública + status do usuário */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", FIRST_STEPS_CONFIG_KEY)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("first_steps_completed_at")
      .eq("id", user.id)
      .single(),
  ]);

  const config = parseFirstStepsConfig(settings?.value ?? null);
  const completed = Boolean(profile?.first_steps_completed_at);

  return NextResponse.json({ config, completed });
}
