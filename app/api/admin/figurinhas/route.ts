import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeRedirectUrl } from "@/lib/sticker-redirect-url";

export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const category     = searchParams.get("category");
  const rarity       = searchParams.get("rarity");
  const active       = searchParams.get("active");
  const isUserType   = searchParams.get("is_user_type");

  const supabase = createAdminClient();
  let query = supabase
    .from("stickers")
    .select(`
      *,
      sticker_categories ( id, name ),
      rarities ( id, name, color_hex )
    `)
    .order("id", { ascending: false });

  if (category)              query = query.eq("category_id", category);
  if (rarity)                query = query.eq("rarity_id", rarity);
  if (active !== null)       query = query.eq("is_active", active === "true");
  if (isUserType !== null)   query = query.eq("is_user_type", isUserType === "true");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json();
  const { name, description, image_url, category_id, rarity_id, is_user_type, redirect_url } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }
  if (!image_url) {
    return NextResponse.json({ error: "Imagem é obrigatória" }, { status: 400 });
  }
  if (redirect_url && normalizeRedirectUrl(redirect_url) === null) {
    return NextResponse.json({ error: "Link do material inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stickers")
    .insert({
      name: name.trim(),
      description,
      image_url,
      redirect_url: normalizeRedirectUrl(redirect_url),
      category_id: category_id || null,
      rarity_id: rarity_id || null,
      is_user_type: !!is_user_type,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
