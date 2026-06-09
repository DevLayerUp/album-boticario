"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  bucket = "assets",
  folder = "misc",
  label = "Imagem",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5 MB.");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Formato inválido. Use PNG, JPG ou WEBP.");
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

      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar imagem");
      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
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
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          htmlFor="img-upload"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-gb-green/40 hover:bg-gb-green/5 hover:text-gb-green"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Upload size={20} />
              <span className="text-xs">Enviar imagem</span>
            </>
          )}
        </label>
      )}

      <input
        id="img-upload"
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
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
