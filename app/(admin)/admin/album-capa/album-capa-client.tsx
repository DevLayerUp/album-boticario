"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle, BookOpen, Trash2 } from "lucide-react";
import { AdminStorageImage } from "@/components/admin/admin-storage-image";
import { ImageUploader } from "@/components/admin/image-uploader";

interface AlbumCapaClientProps {
  currentUrl: string | null;
}

export function AlbumCapaClient({ currentUrl }: AlbumCapaClientProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(currentUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/app-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "album_cover_url", value: coverUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = coverUrl !== currentUrl;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Capa do Álbum</h1>
        <p className="mt-1 text-sm text-gray-500">
          Faça upload da imagem que aparecerá como capa quando o usuário abre o álbum.
          Dimensões recomendadas: <strong>698 × 880 px</strong> (PNG, JPG ou WEBP, máx. 5 MB).
        </p>
      </div>

      {/* Current cover preview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Visualização
        </h2>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Preview card */}
          <div
            className="relative flex h-[220px] w-[174px] shrink-0 overflow-hidden rounded-xl shadow-lg"
            style={{ background: "#0d6632" }}
          >
            {coverUrl ? (
              <AdminStorageImage
                src={coverUrl}
                alt="Capa do álbum"
                fill
                className="object-cover"
                sizes="174px"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
                <BookOpen size={32} className="text-white/40" strokeWidth={1.5} />
                <p className="text-xs text-white/40">Sem capa</p>
              </div>
            )}
          </div>

          {/* Upload area */}
          <div className="flex-1 space-y-4">
            <ImageUploader
              label="Imagem da capa"
              value={coverUrl}
              onChange={setCoverUrl}
              bucket="assets"
              folder="album-cover"
            />

            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="flex items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-700"
              >
                <Trash2 size={12} />
                Remover imagem
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-gb-green px-6 text-sm font-semibold text-white transition-all hover:bg-gb-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={16} />
          ) : null}
          {saving ? "Salvando…" : saved ? "Salvo!" : "Salvar alterações"}
        </button>

        {!isDirty && !saving && (
          <p className="text-sm text-gray-400">Sem alterações pendentes.</p>
        )}
      </div>
    </div>
  );
}
