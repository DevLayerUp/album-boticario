import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import {
  STICKER_CARD,
  STICKER_CARD_BG,
  STICKER_EXPORT,
  getStickerFrameExport,
  getStickerPhotoPlacement,
  type StickerPhotoTransform,
} from "@/lib/sticker-card";

const BG_PATH = path.join(process.cwd(), "public", STICKER_CARD_BG.replace(/^\//, ""));

const DISPLAY_TO_EXPORT = STICKER_EXPORT.width / STICKER_CARD.width;

function createFrameOverlay(
  width: number,
  height: number,
  radius: number,
  borderWidth: number,
  color: string,
): Buffer {
  const half = borderWidth / 2;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="${half}"
        y="${half}"
        width="${width - borderWidth}"
        height="${height - borderWidth}"
        rx="${radius}"
        ry="${radius}"
        fill="none"
        stroke="${color}"
        stroke-width="${borderWidth}"
      />
    </svg>`;

  return Buffer.from(svg);
}

/** Garante PNG com canal alpha e área transparente real. */
export async function validateCutoutPng(
  buffer: Buffer,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const meta = await sharp(buffer).metadata();
  if (meta.format !== "png") {
    return { ok: false, reason: "O recorte precisa ser PNG transparente." };
  }

  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const total = info.width * info.height;
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 240) transparent++;
  }

  if (transparent / total < 0.04) {
    return {
      ok: false,
      reason: "O fundo não foi removido. Use uma foto nítida da pessoa.",
    };
  }

  if (await cutoutLooksLikeStickerTemplate(buffer)) {
    return {
      ok: false,
      reason:
        "Parece uma captura do card. Envie a foto original da pessoa, não um print da tela.",
    };
  }

  return { ok: true };
}

async function cutoutLooksLikeStickerTemplate(cutout: Buffer): Promise<boolean> {
  const cutMeta = await sharp(cutout).metadata();
  const cw = cutMeta.width ?? 0;
  const ch = cutMeta.height ?? 0;
  if (cw < 500 || ch < 700) return false;

  const cardRatio = STICKER_EXPORT.width / STICKER_EXPORT.height;
  const cutRatio = cw / ch;
  if (Math.abs(cutRatio - cardRatio) > 0.06) return false;

  const sampleSize = 48;
  const cutSample = await sharp(cutout)
    .resize(sampleSize, sampleSize, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const bgSample = await sharp(BG_PATH)
    .resize(sampleSize, sampleSize, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  let diff = 0;
  for (let i = 0; i < cutSample.length; i++) {
    diff += Math.abs(cutSample[i] - bgSample[i]);
  }

  return diff / cutSample.length < 14;
}

export async function removePhotoBackground(
  photoBuffer: Buffer,
  removeBgKey: string | undefined,
): Promise<Buffer> {
  if (!removeBgKey) {
    return photoBuffer;
  }

  try {
    const rbForm = new FormData();
    rbForm.append(
      "image_file",
      new Blob([new Uint8Array(photoBuffer)], { type: "image/png" }),
      "photo.png",
    );
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
      return photoBuffer;
    }

    return Buffer.from(await rbRes.arrayBuffer());
  } catch (err) {
    console.error("remove.bg fetch error:", err);
    return photoBuffer;
  }
}

export async function composeSticker(
  noBgBuffer: Buffer,
  transform: StickerPhotoTransform,
): Promise<Buffer> {
  const placement = getStickerPhotoPlacement();
  const slotW = placement.width;
  const slotH = placement.height;
  const canvasW = STICKER_EXPORT.width;
  const canvasH = STICKER_EXPORT.height;

  const oriented = await sharp(noBgBuffer).rotate().png().toBuffer();
  const meta = await sharp(oriented).metadata();
  const imageWidth = meta.width ?? 1;
  const imageHeight = meta.height ?? 1;

  const fitScale =
    Math.min(slotW / imageWidth, slotH / imageHeight) * transform.scale;
  const scaledW = Math.round(imageWidth * fitScale);
  const scaledH = Math.round(imageHeight * fitScale);

  const offsetX = Math.round(transform.offsetX * DISPLAY_TO_EXPORT);
  const offsetY = Math.round(transform.offsetY * DISPLAY_TO_EXPORT);
  const photoLeft = Math.round(
    placement.left + (slotW - scaledW) / 2 + offsetX,
  );
  const photoTop = Math.round(
    placement.top + (slotH - scaledH) / 2 + offsetY,
  );

  const photoResized = await sharp(oriented)
    .resize(scaledW, scaledH, { fit: "fill" })
    .png()
    .toBuffer();

  const clipLeft = Math.max(0, photoLeft);
  const clipTop = Math.max(0, photoTop);
  const extractLeft = Math.max(0, -photoLeft);
  const extractTop = Math.max(0, -photoTop);
  const clipWidth = Math.min(scaledW - extractLeft, canvasW - clipLeft);
  const clipHeight = Math.min(scaledH - extractTop, canvasH - clipTop);

  const composites: { input: Buffer; left: number; top: number }[] = [];

  if (clipWidth > 0 && clipHeight > 0) {
    const needsClip =
      extractLeft > 0 ||
      extractTop > 0 ||
      clipWidth < scaledW ||
      clipHeight < scaledH;

    const photoInput = needsClip
      ? await sharp(photoResized)
          .extract({
            left: extractLeft,
            top: extractTop,
            width: clipWidth,
            height: clipHeight,
          })
          .png()
          .toBuffer()
      : photoResized;

    composites.push({
      input: photoInput,
      left: clipLeft,
      top: clipTop,
    });
  }

  const bgBuffer = await readFile(BG_PATH);
  const frame = getStickerFrameExport();
  const frameOverlay = await sharp(
    createFrameOverlay(
      canvasW,
      canvasH,
      frame.borderRadius,
      frame.borderWidth,
      frame.color,
    ),
  )
    .png()
    .toBuffer();

  return sharp(bgBuffer)
    .resize(canvasW, canvasH, { fit: "fill" })
    .composite([...composites, { input: frameOverlay, left: 0, top: 0 }])
    .png()
    .toBuffer();
}
