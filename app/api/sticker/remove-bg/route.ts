import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { removePhotoBackground } from "@/lib/sticker-image";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

/**
 * Fallback server-side — remove.bg quando o processamento no navegador falha ou expira.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const removeBgKey = process.env.REMOVE_BG_API_KEY?.trim();
  if (!removeBgKey) {
    return NextResponse.json(
      { error: "Serviço de recorte indisponível no momento." },
      { status: 503 },
    );
  }

  const rl = checkRateLimit(`sticker:remove-bg:${user.id}`, 6, 60 * 60 * 1_000);
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
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Imagem não enviada." }, { status: 400 });
  }

  const type = image.type.toLowerCase();
  const name = image.name.toLowerCase();
  const allowed =
    ALLOWED_TYPES.includes(type) ||
    type === "" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");

  if (!allowed) {
    return NextResponse.json(
      { error: "Formato inválido. Use JPG, PNG ou WebP." },
      { status: 400 },
    );
  }

  if (image.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Imagem muito grande. Tente outra foto." },
      { status: 400 },
    );
  }

  const inputBuffer = Buffer.from(await image.arrayBuffer());

  let cutoutBuffer: Buffer;
  try {
    cutoutBuffer = await removePhotoBackground(inputBuffer, removeBgKey);
  } catch (err) {
    console.error("[sticker/remove-bg] remove.bg error:", err);
    return NextResponse.json(
      { error: "Não foi possível remover o fundo." },
      { status: 502 },
    );
  }

  if (cutoutBuffer.equals(inputBuffer)) {
    return NextResponse.json(
      { error: "Não foi possível remover o fundo da foto." },
      { status: 502 },
    );
  }

  return new NextResponse(new Uint8Array(cutoutBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
