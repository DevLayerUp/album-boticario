import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const bucket = (form.get("bucket") as string) || "assets";
  const folder = (form.get("folder") as string) || "misc";

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
