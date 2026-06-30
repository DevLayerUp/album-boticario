"use client";

import { useCallback, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { normalizeImageFileForUpload } from "@/lib/normalize-image-file";
import { STICKER_UPLOAD_ZONE, type StickerPhotoTransform } from "@/lib/sticker-card";
import { removeBackgroundInBrowser } from "@/lib/remove-background-client";
import { assertCutoutHasTransparency } from "@/lib/validate-cutout-client";
import { cn } from "@/lib/utils";
import { FigurinhaOutlineButton } from "./figurinha-actions";
import { FigurinhaCardScaler } from "./figurinha-card-scaler";
import { PhotoEditor } from "./photo-editor";
import { StickerCard, stickerUploadZonePosition } from "./sticker-card";
import { StickerUploadCard } from "./sticker-upload-card";

interface PhotoUploaderProps {
  onGenerate: (cutoutBlob: Blob, transform: StickerPhotoTransform) => void;
  generating?: boolean;
  error?: string | null;
  hasExistingSticker?: boolean;
  onCancelRecreate?: () => void;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_MB = 10;

/** Inputs ocultos mas acionáveis no iOS/Android (sr-only quebra câmera em alguns devices). */
const HIDDEN_FILE_INPUT_CLASS =
  "pointer-events-none fixed -left-[9999px] h-px w-px opacity-0";

type Phase = "pick" | "removing-bg" | "edit";

export function PhotoUploader({
  onGenerate,
  generating = false,
  error: externalError,
  hasExistingSticker = false,
  onCancelRecreate,
}: PhotoUploaderProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("pick");
  const [cutoutSrc, setCutoutSrc] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<string | null>(null);

  const error = externalError ?? localError;
  const slot = stickerUploadZonePosition();
  const inputsDisabled = phase === "removing-bg";

  const validate = (file: File): string | null => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    const allowed =
      ALLOWED_TYPES.includes(type) ||
      type === "" ||
      name.endsWith(".heic") ||
      name.endsWith(".heif");

    if (!allowed) return "Use uma foto JPG, PNG ou WebP.";
    if (file.size > MAX_MB * 1024 * 1024) return `A foto deve ter menos de ${MAX_MB} MB.`;
    return null;
  };

  const reset = useCallback(() => {
    if (cutoutSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(cutoutSrc);
    }
    setCutoutSrc(null);
    setCutoutBlob(null);
    setPhase("pick");
    setLocalError(null);
  }, [cutoutSrc]);

  const processFile = useCallback(async (file: File) => {
    setLocalError(null);
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }

    setPhase("removing-bg");
    setLoadingHint("Preparando recorte…");

    try {
      const normalized = await normalizeImageFileForUpload(file);
      const blob = await removeBackgroundInBrowser(normalized, (fraction) => {
        setLoadingHint(
          fraction < 0.2
            ? "Carregando modelo (só na 1ª vez)…"
            : "Removendo fundo…",
        );
      });

      await assertCutoutHasTransparency(blob);

      setCutoutBlob(blob);
      setCutoutSrc(URL.createObjectURL(blob));
      setLocalError(null);
      setPhase("edit");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar a foto.";
      setLocalError(message);
      setPhase("pick");
    } finally {
      setLoadingHint(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const openGallery = () => {
    if (inputsDisabled) return;
    galleryInputRef.current?.click();
  };

  const openCamera = () => {
    if (inputsDisabled) return;
    cameraInputRef.current?.click();
  };

  if (phase === "edit" && cutoutSrc && cutoutBlob) {
    return (
      <PhotoEditor
        cutoutSrc={cutoutSrc}
        confirming={generating}
        error={error}
        onBack={reset}
        onConfirm={(transform) => onGenerate(cutoutBlob, transform)}
      />
    );
  }

  const showUploadCard = phase === "pick" || phase === "removing-bg";

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <input
        ref={galleryInputRef}
        id="photo-gallery"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        className={HIDDEN_FILE_INPUT_CLASS}
        onChange={handleFileChange}
        disabled={inputsDisabled}
      />

      <input
        ref={cameraInputRef}
        id="photo-camera"
        type="file"
        accept="image/*"
        capture="user"
        className={HIDDEN_FILE_INPUT_CLASS}
        onChange={handleFileChange}
        disabled={inputsDisabled}
      />

      {showUploadCard ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (phase === "pick") setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className="relative w-full"
        >
          <FigurinhaCardScaler>
            <button
              type="button"
              onClick={openGallery}
              disabled={inputsDisabled}
              className={cn(
                "w-full border-0 bg-transparent p-0",
                phase === "pick" ? "cursor-pointer" : "cursor-wait",
              )}
            >
              <StickerUploadCard
                dragOver={dragOver}
                loading={phase === "removing-bg"}
                loadingMessage={loadingHint ?? "Removendo fundo…"}
              />
            </button>
          </FigurinhaCardScaler>
        </div>
      ) : (
        <FigurinhaCardScaler>
          <div className="group/card relative">
            <StickerCard />
            <button
              type="button"
              onClick={openGallery}
              className="absolute z-20 cursor-pointer border-0 bg-transparent p-0"
              style={{
                top: slot.top,
                left: slot.left,
                width: STICKER_UPLOAD_ZONE.width,
                height: STICKER_UPLOAD_ZONE.height,
              }}
            >
              <span className="sr-only">Carregar imagem</span>
            </button>
          </div>
        </FigurinhaCardScaler>
      )}

      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        {phase === "pick" ? (
          <>
            <button
              type="button"
              onClick={openCamera}
              className="inline-flex h-11 min-h-11 cursor-pointer items-center justify-center gap-2 rounded-pill border border-white/40 px-6 text-sm font-medium text-white/90 transition-colors duration-200 hover:border-white/70 hover:bg-white/5 active:scale-[0.98]"
            >
              <Camera className="size-4" aria-hidden />
              Tirar selfie
            </button>

            {hasExistingSticker && onCancelRecreate ? (
              <FigurinhaOutlineButton onClick={onCancelRecreate}>
                Cancelar
              </FigurinhaOutlineButton>
            ) : (
              <FigurinhaOutlineButton disabled>
                Criar nova figurinha
              </FigurinhaOutlineButton>
            )}
          </>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="max-w-sm text-center text-sm font-medium text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
