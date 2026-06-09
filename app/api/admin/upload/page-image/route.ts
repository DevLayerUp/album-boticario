import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminGuard } from "@/lib/admin-guard";

/**
 * POST /api/admin/upload/page-image
 * Upload an image to the 'assets' bucket for info pages.
 * Body: FormData with field "file"
 * Returns: { url }
 */
export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "FormData inválido" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Campo 'file' obrigatório" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
  }

  const maxMB = 5;
  if (file.size > maxMB * 1024 * 1024) {
    return NextResponse.json({ error: `Arquivo muito grande (máx ${maxMB} MB)` }, { status: 400 });
  }

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `pages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createAdminClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error: upErr } = await supabase.storage
    .from("assets")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
