import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json();
  const { title, description, type, target_value, reward_packs, image_url, expires_at, is_active } =
    body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("missions")
    .insert({
      title: title.trim(),
      description,
      type: type || "custom",
      target_value: target_value ?? 1,
      reward_packs: reward_packs ?? 1,
      image_url: image_url || null,
      expires_at: expires_at || null,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
