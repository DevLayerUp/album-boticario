"use client";

import { useState, useRef, useId } from "react";
import { Upload, X, Loader2, Film } from "lucide-react";

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

interface VideoUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  maxSizeBytes?: number;
}

export function VideoUploader({
  value,
  onChange,
  bucket = "landing",
  folder = "welcome",
  label = "Vídeo",
  maxSizeBytes = 50 * 1024 * 1024,
}: VideoUploaderProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;

    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setError(`Arquivo muito grande. Máximo ${maxMb} MB.`);
      return;
    }
    if (!VIDEO_TYPES.includes(file.type)) {
      setError("Formato inválido. Use MP4, WebM ou MOV.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);
      form.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar vídeo");
      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar vídeo");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-gray-700">{label}</span>

      {value ? (
        <div className="relative w-full max-w-[280px] overflow-hidden rounded-xl border border-gray-200 bg-gray-900">
          <video
            src={value}
            className="aspect-[399/709] w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Remover vídeo"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex h-40 w-full max-w-[280px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-gb-green/40 hover:bg-gb-green/5 hover:text-gb-green"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Film size={20} />
              <span className="text-xs">Enviar vídeo</span>
              <span className="text-[10px] text-gray-400">MP4, WebM ou MOV · máx. 50 MB</span>
            </>
          )}
        </label>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
