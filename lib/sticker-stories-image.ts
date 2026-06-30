/** Formato vertical 9:16 para Instagram Stories. */
export const STORIES_WIDTH = 1080;
export const STORIES_HEIGHT = 1920;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a figurinha."));
    img.src = src;
  });
}

/** Monta PNG 1080×1920 com a figurinha centralizada para Stories. */
export async function createStickerStoriesImage(stickerUrl: string): Promise<File> {
  const sticker = await loadImage(stickerUrl);
  const canvas = document.createElement("canvas");
  canvas.width = STORIES_WIDTH;
  canvas.height = STORIES_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");

  const gradient = ctx.createLinearGradient(0, 0, 0, STORIES_HEIGHT);
  gradient.addColorStop(0, "#0a2e24");
  gradient.addColorStop(0.55, "#0f4a38");
  gradient.addColorStop(1, "#1a6b52");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STORIES_WIDTH, STORIES_HEIGHT);

  const maxW = STORIES_WIDTH * 0.82;
  const maxH = STORIES_HEIGHT * 0.68;
  const scale = Math.min(maxW / sticker.width, maxH / sticker.height);
  const w = sticker.width * scale;
  const h = sticker.height * scale;
  const x = (STORIES_WIDTH - w) / 2;
  const y = (STORIES_HEIGHT - h) / 2 - 60;

  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 16;
  ctx.drawImage(sticker, x, y, w, h);
  ctx.shadowColor = "transparent";

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 40px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Fãs por Natureza", STORIES_WIDTH / 2, STORIES_HEIGHT - 140);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText("Minha figurinha 🌿", STORIES_WIDTH / 2, STORIES_HEIGHT - 88);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Falha ao gerar imagem."))),
      "image/png",
      1,
    );
  });

  return new File([blob], "figurinha-stories.png", { type: "image/png" });
}

export async function downloadStickerStoriesFile(file: File): Promise<void> {
  const objectUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
