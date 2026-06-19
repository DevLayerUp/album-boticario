"use client";

import { useCallback, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { STICKER_UPLOAD_ZONE, type StickerPhotoTransform } from "@/lib/sticker-card";
import { assertCutoutHasTransparency } from "@/lib/validate-cutout-client";
import { FigurinhaPanel } from "./figurinha-panel";
import { PhotoEditor } from "./photo-editor";
import { StickerCard, stickerUploadZonePosition } from "./sticker-card";

interface PhotoUploaderProps {
  onGenerate: (cutoutBlob: Blob, transform: StickerPhotoTransform) => void;
  generating?: boolean;
  error?: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 10;

type Phase = "pick" | "removing-bg" | "edit";

export function PhotoUploader({ onGenerate, generating = false, error: externalError }: PhotoUploaderProps) {
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

  if (phase === "removing-bg") {
    return (
      <FigurinhaPanel
        title="Removendo fundo"
        description="Estamos preparando sua foto para o ajuste no card."
      >
        <div className="relative">
          <StickerCard />
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/60">
            <Loader2 className="size-10 animate-spin text-verde-500" aria-hidden />
            <p className="text-sm font-medium text-verde-escuro-500">Removendo fundo…</p>
          </div>
        </div>
      </FigurinhaPanel>
    );
  }

  return (
    <FigurinhaPanel
      title="Enviar foto"
      description="Toque na área amarela do card ou arraste uma imagem. Formatos: JPG, PNG ou WebP até 10 MB."
    >
      <input
        id="photo-gallery"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      <input
        id="photo-camera"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className="group/card relative"
      >
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
          <div className="flex h-full w-full items-center justify-center">
            <div
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl transition-all duration-200",
                dragOver
                  ? "scale-[1.03] bg-white/25 ring-2 ring-inset ring-white/90"
                  : "bg-transparent ring-2 ring-inset ring-white/0 group-hover/card:scale-[1.02] group-hover/card:bg-white/15 group-hover/card:ring-white/70",
              )}
            >
              <Upload
                className={cn(
                  "size-8 text-verde-escuro-500 drop-shadow-sm transition-opacity duration-200 sm:size-9",
                  dragOver ? "opacity-100" : "opacity-70 group-hover/card:opacity-100",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "max-w-[130px] text-center text-xs font-bold uppercase tracking-wide text-verde-escuro-500 drop-shadow-sm transition-opacity duration-200",
                  dragOver ? "opacity-100" : "opacity-0 group-hover/card:opacity-100",
                )}
              >
                Enviar foto
              </span>
            </div>
          </div>
        </label>
      </div>

      <label
        htmlFor="photo-camera"
        className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-pill border border-verde-500 px-8 font-medium text-verde-500 transition-colors hover:bg-verde-500/10 active:scale-[0.98]"
      >
        <Camera className="size-4" aria-hidden />
        Tirar selfie
      </label>

      {error ? (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </FigurinhaPanel>
  );
}
