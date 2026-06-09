import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/trades/wishes/mine
 * Retorna os pedidos abertos do usuário autenticado.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trade_wishes")
    .select(`
      id, status, created_at,
      stickers ( id, name, image_url, rarities ( name, slug, color_hex ) )
    `)
    .eq("user_id", user.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
