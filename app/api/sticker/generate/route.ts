import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limit";

// Dimensões canônicas da figurinha (proporção 4:5.5 ≈ card de colecionável)
const STICKER_W = 400;
const STICKER_H = 550;

// Área da foto dentro da moldura (centralizada verticalmente)
const PHOTO_W = 260;
const PHOTO_H = 320;
const PHOTO_TOP = 90;
const PHOTO_LEFT = 70;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // ── Rate limit: 5 gerações por hora por usuário ────────────────────
  const rl = checkRateLimit(`sticker:${user.id}`, 5, 60 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em 1 hora." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1_000)) },
      }
    );
  }

  // ── 1. Validar arquivo ─────────────────────────────────────────────
  const formData = await request.formData();
  const photo = formData.get("photo") as File | null;

  if (!photo) {
    return NextResponse.json(
      { error: "Nenhuma foto enviada." },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.includes(photo.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Use JPG, PNG ou WebP." },
      { status: 400 },
    );
  }
  if (photo.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Imagem muito grande (máx 10 MB)." },
      { status: 400 },
    );
  }

  // ── 2. Remover fundo via remove.bg API ────────────────────────────
  // Chamada direta da API route (sem precisar de Edge Function deployada)
  let noBgBuffer: Buffer;

  const removeBgKey = process.env.REMOVE_BG_API_KEY;

  if (removeBgKey) {
    try {
      const rbForm = new FormData();
      rbForm.append("image_file", photo);
      rbForm.append("size", "auto");

      const rbRes = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": removeBgKey },
        body: rbForm,
      });

      if (!rbRes.ok) {
        const errText = await rbRes.text();
        console.error("remove.bg API error:", rbRes.status, errText);
        // Fallback para foto original
        const bytes = await photo.arrayBuffer();
        noBgBuffer = Buffer.from(bytes);
      } else {
        noBgBuffer = Buffer.from(await rbRes.arrayBuffer());
      }
    } catch (err) {
      console.error("remove.bg fetch error:", err);
      const bytes = await photo.arrayBuffer();
      noBgBuffer = Buffer.from(bytes);
    }
  } else {
    // Sem chave configurada — usa foto original
    console.warn("REMOVE_BG_API_KEY não configurada, usando foto original.");
    const bytes = await photo.arrayBuffer();
    noBgBuffer = Buffer.from(bytes);
  }

  // ── 3. Compor figurinha ─────────────────────────────────────────────
  // Redimensiona a foto para caber na área da moldura, preservando transparência
  const photoResized = await sharp(noBgBuffer)
    .resize(PHOTO_W, PHOTO_H, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  let stickerBuffer: Buffer;

  // Tenta buscar a moldura oficial do Storage
  const frameUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/sticker-frame.png`;

  try {
    const frameRes = await fetch(frameUrl, { cache: "no-store" });
    if (!frameRes.ok) throw new Error(`Frame HTTP ${frameRes.status}`);

    const frameBuffer = Buffer.from(await frameRes.arrayBuffer());
    stickerBuffer = await sharp(frameBuffer)
      .resize(STICKER_W, STICKER_H, { fit: "fill" })
      .composite([{ input: photoResized, top: PHOTO_TOP, left: PHOTO_LEFT }])
      .png()
      .toBuffer();
  } catch {
    // Fallback: moldura gerada dinamicamente com cores GB
    stickerBuffer = await buildFallbackFrame(photoResized);
  }

  // ── 4. Upload para Supabase Storage ────────────────────────────────
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

  // ── 5. Atualizar profile ────────────────────────────────────────────
  await supabase
    .from("profiles")
    .update({ sticker_url: publicUrl })
    .eq("id", user.id);

  return NextResponse.json({ sticker_url: publicUrl });
}

// ── Moldura fallback gerada com sharp ──────────────────────────────────────
// Cream background + borda verde + área de foto levemente sombreada
async function buildFallbackFrame(photoBuffer: Buffer): Promise<Buffer> {
  // Fundo cor creme GB
  const base = await sharp({
    create: {
      width: STICKER_W,
      height: STICKER_H,
      channels: 4,
      background: { r: 247, g: 243, b: 236, alpha: 1 }, // #F7F3EC
    },
  })
    .png()
    .toBuffer();

  // Overlay da foto
  const withPhoto = await sharp(base)
    .composite([
      {
        input: photoBuffer,
        top: PHOTO_TOP,
        left: PHOTO_LEFT,
      },
    ])
    .png()
    .toBuffer();

  // Rodapé verde com texto "Grupo Boticário" (SVG overlay)
  const footerSvg = Buffer.from(`
    <svg width="${STICKER_W}" height="${STICKER_H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="${STICKER_H - 80}" width="${STICKER_W}" height="80" fill="#00643A" rx="0"/>
      <text x="${STICKER_W / 2}" y="${STICKER_H - 46}" font-family="serif" font-size="18" font-weight="700"
        fill="#D9A441" text-anchor="middle" letter-spacing="3">GRUPO BOTICÁRIO</text>
      <text x="${STICKER_W / 2}" y="${STICKER_H - 22}" font-family="sans-serif" font-size="12"
        fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="1">Álbum de Figurinhas</text>
      <rect x="0" y="0" width="${STICKER_W}" height="${STICKER_H}" fill="none"
        stroke="#00643A" stroke-width="8" rx="16"/>
    </svg>
  `);

  return sharp(withPhoto)
    .composite([{ input: footerSvg, blend: "over" }])
    .png()
    .toBuffer();
}
