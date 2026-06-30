const OUTPUT_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function isHeicLike(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/** Converte HEIC / tipo vazio (comum na câmera do celular) para JPEG. */
export async function normalizeImageFileForUpload(file: File): Promise<File> {
  const type = file.type.toLowerCase();

  if (OUTPUT_TYPES.has(type)) {
    return file;
  }

  const shouldConvert =
    isHeicLike(file) || type === "" || type === "application/octet-stream";

  if (!shouldConvert) {
    throw new Error("Use uma foto JPG, PNG ou WebP.");
  }

  try {
    const bitmap = await createImageBitmap(file);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível.");
      ctx.drawImage(bitmap, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error("Falha na conversão.")),
          "image/jpeg",
          0.92,
        );
      });

      const baseName = file.name.replace(/\.[^.]+$/, "") || "selfie";
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    } finally {
      bitmap.close();
    }
  } catch {
    throw new Error(
      "Não foi possível processar a foto do celular. Tente galeria ou outro formato.",
    );
  }
}
