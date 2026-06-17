"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value:         string | null;
  onChange:      (url: string | null) => void;
  bucket?:       string;
  folder?:       string;
  label?:        string;
  /** Tamanho máximo em bytes. Padrão: 5 MB. */
  maxSizeBytes?: number;
  /** Marcar a imagem de preview como prioritária (LCP). */
  priority?:     boolean;
  /** Aceitar GIF animado além de PNG/JPG/WEBP. */
  acceptGif?:    boolean;
}

export function ImageUploader({
  value,
  onChange,
  bucket       = "assets",
  folder       = "misc",
  label        = "Imagem",
  maxSizeBytes = 5 * 1024 * 1024,
  priority     = false,
  acceptGif    = false,
}: ImageUploaderProps) {
  const allowedTypes = acceptGif
    ? ["image/png", "image/jpeg", "image/webp", "image/gif"]
    : ["image/png", "image/jpeg", "image/webp"];
  const acceptAttr = acceptGif
    ? "image/png,image/jpeg,image/webp,image/gif"
    : "image/png,image/jpeg,image/webp";
  const inputRef   = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setError(`Arquivo muito grande. Máximo ${maxMb} MB.`);
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setError(acceptGif ? "Formato inválido. Use PNG, JPG, WEBP ou GIF." : "Formato inválido. Use PNG, JPG ou WEBP.");
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
      const raw = await res.text();
      let data: { url?: string; error?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { url?: string; error?: string };
        } catch {
          throw new Error(
            res.ok
              ? "Resposta inválida do servidor."
              : `Erro ao enviar imagem (${res.status}).`,
          );
        }
      }

      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar imagem");
      onChange(data.url ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-gray-700">{label}</p>

      {value ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <Image
            src={value}
            alt="Preview"
            fill
            sizes="160px"
            unoptimized
            priority={priority}
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Remover imagem"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          disabled={uploading}
          className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-gb-green/40 hover:bg-gb-green/5 hover:text-gb-green disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Upload size={20} />
              <span className="text-xs">Enviar imagem</span>
            </>
          )}
        </button>
      )}

      {/* Hidden file input — triggered programmatically */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
