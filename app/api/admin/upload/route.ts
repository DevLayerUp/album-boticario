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

  const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
  const allowed = [...imageTypes, ...videoTypes];

  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Use PNG, JPG, WEBP, GIF, MP4, WebM ou MOV." },
      { status: 400 },
    );
  }

  const isVideo = videoTypes.includes(file.type);
  const maxBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return NextResponse.json(
      { error: `Arquivo muito grande. Máximo ${maxMb} MB.` },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
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
