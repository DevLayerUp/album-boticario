"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { ConfirmDialog } from "./confirm-dialog";
import {
  STICKER_DESCRIPTION_MAX_LENGTH,
  validateStickerDescription,
} from "@/lib/sticker-description";
import {
  STICKER_NAME_MAX_LENGTH,
  validateStickerFormattedText,
} from "@/lib/sticker-text-format";
import { StickerFormattedTextField } from "./sticker-formatted-text-field";

interface Category { id: number; name: string }
interface Rarity { id: number; name: string; color_hex: string }

interface FormData {
  name: string;
  description: string;
  redirect_url: string;
  image_url: string | null;
  category_id: string;
  rarity_id: string;
  is_user_type: boolean;
  is_active: boolean;
}

interface FigurinhaFormProps {
  stickerId?: number;
  initial?: Partial<FormData>;
  categories: Category[];
  rarities: Rarity[];
}

const defaults: FormData = {
  name: "",
  description: "",
  redirect_url: "",
  image_url: null,
  category_id: "",
  rarity_id: "",
  is_user_type: false,
  is_active: true,
};

export function FigurinhaForm({
  stickerId,
  initial,
  categories,
  rarities,
}: FigurinhaFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ ...defaults, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!stickerId;

  async function handleSave() {
    if (!form.name.trim()) { setError("Nome é obrigatório"); return; }

    const nameFormatError = validateStickerFormattedText(
      form.name,
      STICKER_NAME_MAX_LENGTH,
      "O nome",
    );
    if (nameFormatError) {
      setError(nameFormatError);
      return;
    }

    const descriptionFormatError = validateStickerFormattedText(
      form.description,
      STICKER_DESCRIPTION_MAX_LENGTH,
      "A descrição",
    );
    if (descriptionFormatError) {
      setError(descriptionFormatError);
      return;
    }

    if (!form.image_url) { setError("Imagem é obrigatória"); return; }
    if (form.redirect_url.trim()) {
      try {
        const parsed = new URL(form.redirect_url.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          setError("O link do material deve começar com http:// ou https://");
          return;
        }
      } catch {
        setError("Informe um link válido para o material");
        return;
      }
    }

    const descriptionError = validateStickerDescription(form.description);
    if (descriptionError) {
      setError(descriptionError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const url = isEdit ? `/api/admin/figurinhas/${stickerId}` : "/api/admin/figurinhas";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          redirect_url: form.redirect_url.trim() || null,
          category_id: form.category_id ? Number(form.category_id) : null,
          rarity_id: form.rarity_id ? Number(form.rarity_id) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/figurinhas");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/figurinhas/${stickerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      router.push("/admin/figurinhas");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Editar figurinha" : "Nova figurinha"}
        </h1>
        {isEdit && (
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} /> Excluir
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <StickerFormattedTextField
              id="fig-name"
              label="Nome"
              value={form.name}
              onChange={(value) => set("name", value)}
              maxLength={STICKER_NAME_MAX_LENGTH}
              rows={2}
              placeholder="Ex.: Arara-vermelha {{sci|Ara chloropterus}}"
              hint="exibido na frente e no verso da figurinha"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <StickerFormattedTextField
              id="fig-description"
              label="Descrição"
              value={form.description}
              onChange={(value) => set("description", value)}
              maxLength={STICKER_DESCRIPTION_MAX_LENGTH}
              rows={4}
              placeholder="Texto do verso / tooltip"
              hint="texto exibido no verso da figurinha no álbum"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Link do material
            </label>
            <input
              type="url"
              value={form.redirect_url}
              onChange={(e) => set("redirect_url", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
              placeholder="https://exemplo.com/material (opcional)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Quando preenchido, exibe um botão no verso da figurinha no álbum.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Raridade</label>
            <select
              value={form.rarity_id}
              onChange={(e) => set("rarity_id", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
            >
              <option value="">Sem raridade</option>
              {rarities.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_user_type}
                onChange={(e) => set("is_user_type", e.target.checked)}
                className="accent-gb-green"
              />
              Slot do usuário
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
                className="accent-gb-green"
              />
              Ativo
            </label>
          </div>

          <div className="sm:col-span-2">
            <ImageUploader
              label="Imagem (PNG/JPG/WEBP, máx 5 MB) *"
              value={form.image_url}
              onChange={(url) => set("image_url", url)}
              bucket="assets"
              folder="stickers"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.push("/admin/figurinhas")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gb-green px-5 py-2 text-sm font-medium text-white hover:bg-gb-green-dark disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Criar figurinha"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Excluir figurinha"
        description="Esta figurinha será removida permanentemente. Esta ação não pode ser desfeita."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
