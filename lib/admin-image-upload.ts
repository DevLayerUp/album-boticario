import sharp from "sharp";

const MAX_EDGE_PX = 2560;
const JPEG_QUALITY = 92;
const WEBP_QUALITY = 92;
const PNG_COMPRESSION = 3;

export interface PreparedAdminImage {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

/**
 * Prepara imagens do admin para storage: mantém o original quando já está em tamanho
 * razoável; só redimensiona arquivos muito grandes (ex.: fotos de câmera) com alta
 * qualidade, para OG/landing sem perda visível.
 */
export async function prepareAdminImageUpload(
  input: ArrayBuffer,
  mimeType: string,
  originalExt: string,
): Promise<PreparedAdminImage> {
  if (mimeType === "image/gif" || mimeType === "image/svg+xml") {
    return {
      buffer: Buffer.from(input),
      contentType: mimeType,
      ext: originalExt,
    };
  }

  const buffer = Buffer.from(input);
  const image = sharp(buffer, { failOn: "none" });
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const longestEdge = Math.max(width, height);

  if (longestEdge <= MAX_EDGE_PX || width === 0 || height === 0) {
    return {
      buffer,
      contentType: mimeType,
      ext: originalExt,
    };
  }

  const pipeline = image.rotate().resize({
    width: width >= height ? MAX_EDGE_PX : undefined,
    height: height > width ? MAX_EDGE_PX : undefined,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (mimeType === "image/png") {
    const out = await pipeline
      .png({ compressionLevel: PNG_COMPRESSION, adaptiveFiltering: true })
      .toBuffer();
    return { buffer: out, contentType: "image/png", ext: "png" };
  }

  if (mimeType === "image/webp") {
    const out = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    return { buffer: out, contentType: "image/webp", ext: "webp" };
  }

  const out = await pipeline
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  return { buffer: out, contentType: "image/jpeg", ext: "jpg" };
}
