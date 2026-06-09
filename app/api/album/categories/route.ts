import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/album/categories — public list of categories that have pages */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sticker_categories")
    .select("id, name, cover_image, description")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
