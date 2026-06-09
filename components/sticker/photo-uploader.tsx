"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoUploaderProps {
  onUpload: (file: File) => void;
  error?: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 10;

export function PhotoUploader({ onUpload, error: externalError }: PhotoUploaderProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = externalError ?? localError;

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return "Use uma foto JPG, PNG ou WebP.";
    if (file.size > MAX_MB * 1024 * 1024) return `A foto deve ter menos de ${MAX_MB} MB.`;
    return null;
  };

  const processFile = useCallback(
    (file: File) => {
      setLocalError(null);
      const err = validate(file);
      if (err) { setLocalError(err); return; }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Resetar o value para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setPreview(null);
    setSelectedFile(null);
    setLocalError(null);
  };

  /* ── Preview selecionado ─────────────────────────────────────────── */
  if (preview && selectedFile) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-white">Ficou boa?</h1>
          <p className="mt-2 text-sm text-white/60">Confirme ou escolha outra foto.</p>
        </div>

        <div className="relative h-72 w-52 overflow-hidden rounded-2xl border-2 border-gb-gold/40 shadow-xl shadow-black/30">
          <Image
            src={preview}
            alt="Pré-visualização da sua foto"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gb-green-deep/60 to-transparent" />
        </div>

        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => onUpload(selectedFile)}
            className="w-full rounded-full bg-gb-gold px-6 py-3.5 font-semibold text-gb-green-deep shadow-lg shadow-gb-gold/25 transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            Usar esta foto
          </button>
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/70 transition-all duration-200 hover:border-white/40 hover:text-white"
          >
            Escolher outra
          </button>
        </div>
      </div>
    );
  }

  /* ── Tela de upload ──────────────────────────────────────────────── */
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      {/* Heading */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">
          Sua figurinha
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Envie uma foto com boa iluminação e rosto visível.
          <br />
          O fundo será removido automaticamente.
        </p>
      </div>

      {/* ── Input de arquivo (galeria) — trigger via <label> ──────── */}
      <input
        id="photo-gallery"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* ── Input de câmera — trigger por ref (precisa de JS p/ capture) */}
      <input
        ref={cameraInputRef}
        id="photo-camera"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* Zona de drop / clique — usa <label> para trigger nativo */}
      <label
        htmlFor="photo-gallery"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "flex h-56 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all duration-200",
          dragOver
            ? "border-gb-gold bg-gb-gold/10 scale-[1.02]"
            : "border-white/25 bg-white/5 hover:border-white/40 hover:bg-white/8",
        )}
      >
        <UploadIcon />
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Arraste sua foto aqui</p>
          <p className="mt-0.5 text-xs text-white/50">
            ou clique para selecionar • JPG, PNG, WebP até 10 MB
          </p>
        </div>
      </label>

      {/* Botão câmera (selfie) — usa <label> diretamente */}
      <label
        htmlFor="photo-camera"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15 active:scale-95"
      >
        <CameraIcon />
        Tirar selfie
      </label>

      {/* Erro */}
      {error && (
        <p role="alert" className="text-center text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Ícones ───────────────────────────────────────────────────────── */

function UploadIcon() {
  return (
    <svg
      width="40" height="40" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round"
      className="text-gb-gold" aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
