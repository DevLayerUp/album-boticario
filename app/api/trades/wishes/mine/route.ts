import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTradeEventDailyUsage } from "@/lib/trade-daily-limit";

/**
 * GET /api/trades/wishes/mine
 * Retorna os pedidos abertos do usuário autenticado e uso do limite diário.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data, error }, dailyLimit] = await Promise.all([
    supabase
      .from("trade_wishes")
      .select(`
        id, status, created_at,
        stickers ( id, name, image_url, rarities ( name, slug, color_hex ) )
      `)
      .eq("user_id", user.id)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    getTradeEventDailyUsage(supabase, user.id).catch((err) => {
      console.error("[trades/wishes/mine] daily limit:", err);
      return null;
    }),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    wishes: data ?? [],
    daily_limit: dailyLimit,
  });
}
