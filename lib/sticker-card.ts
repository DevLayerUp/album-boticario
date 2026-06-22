/**
 * Dimensões e posicionamento do card de figurinha (Figma).
 * Usado no preview (client) e na composição final (server/sharp).
 */
export const STICKER_CARD_BG = "/images/dashboard/bg-minha-figurinha.png";

export const STICKER_CARD = {
  width: 352,
  height: 503,
  borderRadius: 16,
  padding: { top: 8, right: 8, bottom: 64, left: 8 },
} as const;

/** Moldura verde sobreposta à foto (preview + export). */
export const STICKER_FRAME = {
  borderRadius: STICKER_CARD.borderRadius,
  borderWidth: 7,
  color: "#98D622",
} as const;

/** Área de edição da foto = card inteiro. */
export const STICKER_PHOTO = {
  width: STICKER_CARD.width,
  height: STICKER_CARD.height,
  left: 0,
  top: 0,
  minScale: 0.3,
  maxScale: 3,
  /** Escala 1 = recorte inteiro visível dentro do card (sem crop). */
  defaultScale: 1,
} as const;

/** Zona clicável de upload sobre o blob amarelo da arte. */
export const STICKER_UPLOAD_ZONE = {
  width: 251,
  height: 256,
  left: 50,
  top: 121,
} as const;

/** Ajuste manual da foto dentro do slot (coordenadas de exibição). */
export interface StickerPhotoTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export const DEFAULT_STICKER_PHOTO_TRANSFORM: StickerPhotoTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: STICKER_PHOTO.defaultScale,
};

export function parseStickerPhotoTransform(formData: FormData): StickerPhotoTransform {
  const offsetX = Number(formData.get("offset_x") ?? 0);
  const offsetY = Number(formData.get("offset_y") ?? 0);
  const scale = Number(formData.get("scale") ?? STICKER_PHOTO.defaultScale);

  return {
    offsetX: Number.isFinite(offsetX) ? offsetX : 0,
    offsetY: Number.isFinite(offsetY) ? offsetY : 0,
    scale: Number.isFinite(scale)
      ? Math.min(STICKER_PHOTO.maxScale, Math.max(STICKER_PHOTO.minScale, scale))
      : STICKER_PHOTO.defaultScale,
  };
}

/** Resolução de exportação (= arte original do Figma). */
export const STICKER_EXPORT = {
  width: 732,
  height: 1034,
} as const;

/**
 * Ajuste de crop para exibir a figurinha (card retrato) em avatares circulares.
 * A foto fica na zona central do card; sem zoom aparecem margens vazias nas laterais.
 */
export const STICKER_AVATAR_CROP = {
  scale: 1.08,
  objectPosition: "50% 42%",
} as const;

/** Dimensões da foto no preview/editor (contain — recorte inteiro visível). */
export function getPhotoDisplayDimensions(
  imageWidth: number,
  imageHeight: number,
  scale: number,
) {
  const fitScale =
    Math.min(
      STICKER_PHOTO.width / imageWidth,
      STICKER_PHOTO.height / imageHeight,
    ) * scale;

  return {
    width: imageWidth * fitScale,
    height: imageHeight * fitScale,
  };
}

/** @deprecated Use getPhotoDisplayDimensions */
export function getCoverPhotoDimensions(
  imageWidth: number,
  imageHeight: number,
  scale: number,
) {
  return getPhotoDisplayDimensions(imageWidth, imageHeight, scale);
}

export function getInitialPhotoTransform(
  imageWidth: number,
  imageHeight: number,
): StickerPhotoTransform {
  const fitted = getPhotoDisplayDimensions(imageWidth, imageHeight, 1);
  const fill = 0.9;
  const scaleUp = Math.min(
    (STICKER_PHOTO.height * fill) / fitted.height,
    (STICKER_PHOTO.width * fill) / fitted.width,
  );

  return {
    offsetX: 0,
    offsetY: Math.round(STICKER_PHOTO.height * 0.05),
    scale: Math.min(
      STICKER_PHOTO.maxScale,
      Math.max(STICKER_PHOTO.minScale, scaleUp),
    ),
  };
}

const SCALE = STICKER_EXPORT.width / STICKER_CARD.width;

export function getStickerFrameExport() {
  return {
    borderRadius: Math.round(STICKER_FRAME.borderRadius * SCALE),
    borderWidth: Math.round(STICKER_FRAME.borderWidth * SCALE),
    color: STICKER_FRAME.color,
  };
}

/** Posição da foto no canvas de exportação (sharp). */
export function getStickerPhotoPlacement() {
  return {
    width: Math.round(
      STICKER_EXPORT.width * (STICKER_PHOTO.width / STICKER_CARD.width),
    ),
    height: Math.round(
      STICKER_EXPORT.height * (STICKER_PHOTO.height / STICKER_CARD.height),
    ),
    left: Math.round(STICKER_PHOTO.left * SCALE),
    top: Math.round(STICKER_PHOTO.top * SCALE),
  };
}
