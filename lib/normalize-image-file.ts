/** Borda máxima antes do recorte — suficiente para figurinha 732px e bg removal no mobile. */
const MAX_EDGE_PX = 1600;
/** Limite do arquivo bruto da câmera/galeria (antes de comprimir). */
export const MAX_RAW_INPUT_BYTES = 40 * 1024 * 1024;
const JPEG_QUALITY = 0.86;

function isAllowedInputType(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type.startsWith("image/") ||
    type === "" ||
    type === "application/octet-stream" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

async function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  quality: number,
): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("Falha ao comprimir a foto.")),
      "image/jpeg",
      quality,
    );
  });

  return new File([blob], fileName, { type: "image/jpeg" });
}

/**
 * Normaliza selfies da câmera: redimensiona, comprime em JPEG e reduz peso
 * para caber no fluxo de remoção de fundo e no upload da API.
 */
export async function prepareImageFileForUpload(file: File): Promise<File> {
  if (!isAllowedInputType(file)) {
    throw new Error("Use uma foto JPG, PNG ou WebP.");
  }

  if (file.size > MAX_RAW_INPUT_BYTES) {
    throw new Error("A foto é muito grande. Tente outra imagem ou use a galeria.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Não foi possível ler a foto do celular. Tente novamente ou escolha da galeria.",
    );
  }

  try {
    let width = bitmap.width;
    let height = bitmap.height;
    const maxEdge = Math.max(width, height);

    if (maxEdge > MAX_EDGE_PX) {
      const scale = MAX_EDGE_PX / maxEdge;
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível.");

    ctx.drawImage(bitmap, 0, 0, width, height);

    const baseName = file.name.replace(/\.[^.]+$/, "") || "selfie";
    let quality = JPEG_QUALITY;
    let prepared = await canvasToJpegFile(canvas, `${baseName}.jpg`, quality);

    // Selfies em alta resolução podem ainda passar de ~4MB — comprime mais se preciso
    while (prepared.size > 4 * 1024 * 1024 && quality > 0.55) {
      quality -= 0.08;
      prepared = await canvasToJpegFile(canvas, `${baseName}.jpg`, quality);
    }

    return prepared;
  } finally {
    bitmap.close();
  }
}

/** @deprecated Use prepareImageFileForUpload */
export const normalizeImageFileForUpload = prepareImageFileForUpload;

/** Comprime PNG transparente (recorte) se exceder o limite do upload. */
export async function compressCutoutPngForUpload(
  blob: Blob,
  maxBytes = 10 * 1024 * 1024,
): Promise<Blob> {
  if (blob.size <= maxBytes) return blob;

  const bitmap = await createImageBitmap(blob);
  try {
    let width = bitmap.width;
    let height = bitmap.height;
    let lastBlob: Blob = blob;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) break;

      ctx.drawImage(bitmap, 0, 0, width, height);
      const next = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!next) break;
      lastBlob = next;
      if (next.size <= maxBytes) return next;

      width = Math.max(320, Math.round(width * 0.82));
      height = Math.max(320, Math.round(height * 0.82));
    }

    return lastBlob;
  } finally {
    bitmap.close();
  }
}
