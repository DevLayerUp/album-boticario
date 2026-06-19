import { validateCutoutPng } from "@/lib/sticker-image";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function jsonError(message: string, status: number, extra?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers: extra });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Não autorizado.", 401);
  }

  const rl = checkRateLimit(`sticker:${user.id}`, 8, 60 * 60 * 1_000);
  if (!rl.allowed) {
    return jsonError("Muitas tentativas. Tente novamente em 1 hora.", 429, {
      "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1_000)),
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Não foi possível ler o upload. Tente uma imagem menor.", 413);
  }

  const photo = formData.get("photo") as File | null;

  if (!photo) {
    return jsonError("Nenhuma foto enviada.", 400);
  }
  if (!ALLOWED_TYPES.includes(photo.type)) {
    return jsonError("Formato inválido. Use JPG, PNG ou WebP.", 400);
  }
  if (photo.size > MAX_SIZE_BYTES) {
    return jsonError("Imagem muito grande (máx 10 MB).", 400);
  }

  const removeBgKey = process.env.REMOVE_BG_API_KEY;
  if (!removeBgKey) {
    return jsonError(
      "Remoção de fundo indisponível no momento. Tente novamente mais tarde.",
      503,
    );
  }

  let cutoutBuffer: Buffer;

  try {
    const rbForm = new FormData();
    rbForm.append("image_file", photo);
    rbForm.append("size", "auto");
    rbForm.append("format", "png");
    rbForm.append("channels", "rgba");
    rbForm.append("crop", "false");

    const rbRes = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": removeBgKey },
      body: rbForm,
    });

    if (!rbRes.ok) {
      console.error("remove.bg API error:", rbRes.status, await rbRes.text());
      return jsonError(
        "Não foi possível remover o fundo. Tente outra foto ou formato.",
        422,
      );
    }

    cutoutBuffer = Buffer.from(await rbRes.arrayBuffer());
  } catch (err) {
    console.error("remove.bg fetch error:", err);
    return jsonError("Erro ao processar a foto. Tente novamente.", 502);
  }

  const validation = await validateCutoutPng(cutoutBuffer);
  if (!validation.ok) {
    return jsonError(validation.reason, 422);
  }

  return new NextResponse(new Uint8Array(cutoutBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "X-Background-Removed": "true",
    },
  });
}
