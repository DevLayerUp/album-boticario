/** Valida no browser se o blob PNG tem transparência real. */
export async function assertCutoutHasTransparency(
  blob: Blob,
): Promise<{ width: number; height: number }> {
  if (blob.type && !blob.type.includes("png")) {
    throw new Error("Recorte inválido: esperado PNG transparente.");
  }

  const bitmap = await createImageBitmap(blob);
  const width = bitmap.width;
  const height = bitmap.height;
  const sampleW = Math.min(width, 96);
  const sampleH = Math.min(height, 96);
  const canvas = document.createElement("canvas");
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível validar o recorte.");
  }

  ctx.drawImage(bitmap, 0, 0, sampleW, sampleH);
  const { data } = ctx.getImageData(0, 0, sampleW, sampleH);
  bitmap.close();

  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 240) transparent++;
  }

  if (transparent / (sampleW * sampleH) < 0.04) {
    throw new Error(
      "O fundo não foi removido corretamente. Envie uma foto nítida da pessoa.",
    );
  }

  return { width, height };
}
