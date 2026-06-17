"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, AlertCircle, Package, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { DEFAULT_PACK_IMAGE } from "@/lib/pack-settings";

interface PacotinhosAdminClientProps {
  packImageUrl: string | null;
  openingGifUrl: string | null;
}

export function PacotinhosAdminClient({
  packImageUrl: initialPackImage,
  openingGifUrl: initialGif,
}: PacotinhosAdminClientProps) {
  const [packImageUrl, setPackImageUrl] = useState<string | null>(initialPackImage);
  const [openingGifUrl, setOpeningGifUrl] = useState<string | null>(initialGif);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveKey(key: string, value: string | null) {
    const res = await fetch("/api/admin/app-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("pack_image_url", packImageUrl);
      await saveKey("pack_opening_gif_url", openingGifUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const isDirty =
    packImageUrl !== initialPackImage || openingGifUrl !== initialGif;
  const previewImage = packImageUrl || DEFAULT_PACK_IMAGE;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pacotinhos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure a imagem exibida nos cards e o GIF da animação de abertura.
          Arquivos são armazenados no Supabase Storage (bucket <code>assets</code>).
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Imagem do pacotinho
        </h2>
        <p className="text-sm text-gray-500">
          Usada nos cards da lista e no modal antes da abertura.
          Recomendado: PNG ou WEBP, proporção vertical (~392×560 px).
        </p>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-[280px] w-[196px] shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
            <Image
              src={previewImage}
              alt="Prévia do pacotinho"
              fill
              className="object-cover"
              sizes="196px"
              unoptimized={previewImage.endsWith(".gif")}
            />
          </div>
          <div className="flex-1 space-y-4">
            <ImageUploader
              label="Imagem do pacotinho"
              value={packImageUrl}
              onChange={setPackImageUrl}
              bucket="assets"
              folder="pack"
            />
            {packImageUrl && (
              <button
                type="button"
                onClick={() => setPackImageUrl(null)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 size={12} />
                Remover e usar padrão
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          GIF de abertura
        </h2>
        <p className="text-sm text-gray-500">
          Reproduzido no modal ao clicar em &quot;Abrir pacotinho&quot;.
          Use GIF animado (máx. 30 MB).
        </p>

        {openingGifUrl ? (
          <div className="relative mx-auto aspect-[273/390] w-full max-w-[220px] overflow-hidden rounded-2xl border-4 border-white shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={openingGifUrl}
              alt="Prévia do GIF de abertura"
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <Package className="text-gray-300" size={40} />
          </div>
        )}

        <ImageUploader
          label="GIF de abertura"
          value={openingGifUrl}
          onChange={setOpeningGifUrl}
          bucket="assets"
          folder="pack"
          acceptGif
          maxSizeBytes={30 * 1024 * 1024}
        />

        {openingGifUrl && (
          <button
            type="button"
            onClick={() => setOpeningGifUrl(null)}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
          >
            <Trash2 size={12} />
            Remover GIF
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-gb-green px-6 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:cursor-not-allowed disabled:opacity-50"
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
