import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/categories
 * Public endpoint — returns album categories (no auth required).
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sticker_categories")
    .select("id, name, description, cover_image, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
