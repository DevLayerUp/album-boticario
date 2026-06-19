import { createClient } from "@/lib/supabase/server";
import { validarMissoes } from "@/lib/missions";
import { composeSticker } from "@/lib/sticker-image";
import { parseStickerPhotoTransform } from "@/lib/sticker-card";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE_BYTES = 12 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const rl = checkRateLimit(`sticker:generate:${user.id}`, 8, 60 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em 1 hora." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1_000)) },
      },
    );
  }

  const formData = await request.formData();
  const cutout = formData.get("cutout") as File | null;

  if (!cutout) {
    return NextResponse.json({ error: "Recorte da foto não enviado." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(cutout.type)) {
    return NextResponse.json({ error: "Formato de recorte inválido." }, { status: 400 });
  }
  if (cutout.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Recorte muito grande." }, { status: 400 });
  }

  const transform = parseStickerPhotoTransform(formData);
  const cutoutBuffer = Buffer.from(await cutout.arrayBuffer());

  let stickerBuffer: Buffer;
  try {
    stickerBuffer = await composeSticker(cutoutBuffer, transform);
  } catch (err) {
    console.error("composeSticker error:", err);
    return NextResponse.json(
      { error: "Não foi possível compor a figurinha." },
      { status: 500 },
    );
  }

  const fileName = `${user.id}/sticker_${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from("stickers")
    .upload(fileName, stickerBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return NextResponse.json(
      { error: "Falha ao salvar a figurinha." },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("stickers").getPublicUrl(fileName);

  await supabase
    .from("profiles")
    .update({ sticker_url: publicUrl })
    .eq("id", user.id);

  await validarMissoes(supabase, user.id);

  return NextResponse.json({ sticker_url: publicUrl });
}
