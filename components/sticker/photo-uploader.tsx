"use client";

import { useCallback, useState } from "react";
import { Camera } from "lucide-react";
import { STICKER_UPLOAD_ZONE, type StickerPhotoTransform } from "@/lib/sticker-card";
import { assertCutoutHasTransparency } from "@/lib/validate-cutout-client";
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

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 10;

type Phase = "pick" | "removing-bg" | "edit";

export function PhotoUploader({
  onGenerate,
  generating = false,
  error: externalError,
  hasExistingSticker = false,
  onCancelRecreate,
}: PhotoUploaderProps) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [cutoutSrc, setCutoutSrc] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = externalError ?? localError;
  const slot = stickerUploadZonePosition();

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return "Use uma foto JPG, PNG ou WebP.";
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

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/sticker/remove-bg", { method: "POST", body: formData });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const json = (await res.json()) as { error?: string };
          throw new Error(json.error ?? "Não foi possível remover o fundo.");
        }
        throw new Error("Não foi possível remover o fundo.");
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("image/png")) {
        throw new Error("Recorte inválido retornado pelo servidor.");
      }

      const blob = await res.blob();
      if (!blob.size) {
        throw new Error("Resposta vazia do servidor.");
      }

      await assertCutoutHasTransparency(blob);

      setCutoutBlob(blob);
      setCutoutSrc(URL.createObjectURL(blob));
      setPhase("edit");
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Falha de conexão ao enviar a imagem. Verifique sua internet ou use uma foto menor."
          : err instanceof Error
            ? err.message
            : "Erro ao processar a foto.";
      setLocalError(message);
      setPhase("pick");
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
        id="photo-gallery"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        disabled={phase === "removing-bg"}
      />

      <input
        id="photo-camera"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="sr-only"
        onChange={handleFileChange}
        disabled={phase === "removing-bg"}
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
            <label
              htmlFor="photo-gallery"
              className={phase === "pick" ? "cursor-pointer" : "cursor-wait"}
            >
              <StickerUploadCard
                dragOver={dragOver}
                loading={phase === "removing-bg"}
              />
            </label>
          </FigurinhaCardScaler>
        </div>
      ) : (
        <FigurinhaCardScaler>
          <div className="group/card relative">
            <StickerCard />
            <label
              htmlFor="photo-gallery"
              className="absolute z-20 cursor-pointer"
              style={{
                top: slot.top,
                left: slot.left,
                width: STICKER_UPLOAD_ZONE.width,
                height: STICKER_UPLOAD_ZONE.height,
              }}
            >
              <span className="sr-only">Carregar imagem</span>
            </label>
          </div>
        </FigurinhaCardScaler>
      )}

      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        {phase === "pick" ? (
          <>
            <label
              htmlFor="photo-camera"
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill border border-white/40 px-6 text-sm font-medium text-white/90 transition-colors hover:border-white/70 hover:bg-white/5"
            >
              <Camera className="size-4" aria-hidden />
              Tirar selfie
            </label>

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
