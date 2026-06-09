"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Category {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
  sort_order: number;
}

interface FormState {
  name: string;
  description: string;
  cover_image: string | null;
  sort_order: number;
}

const empty: FormState = { name: "", description: "", cover_image: null, sort_order: 0 };

export function CategoriasClient({ initialData }: { initialData: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditId(null);
    setForm(empty);
    setError(null);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      cover_image: cat.cover_image,
      sort_order: cat.sort_order,
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Nome é obrigatório"); return; }
    setSaving(true);
    setError(null);

    try {
      const url = editId
        ? `/api/admin/categorias/${editId}`
        : "/api/admin/categorias";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (editId) {
        setCategories((prev) => prev.map((c) => (c.id === editId ? data : c)));
      } else {
        setCategories((prev) => [...prev, data]);
      }
      closeForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categorias/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categorias</h1>
          <p className="text-sm text-gray-500">{categories.length} categoria(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white hover:bg-gb-green-dark"
        >
          <Plus size={15} /> Nova categoria
        </button>
      </div>

      {error && !showForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Nenhuma categoria criada. Crie a primeira!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Capa</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-center">Ordem</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {cat.cover_image ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                        <Image src={cat.cover_image} alt={cat.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.description ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-20">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {editId ? "Editar categoria" : "Nova categoria"}
              </h2>
              <button onClick={closeForm} className="rounded-md p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                  placeholder="Ex: Natura, O Boticário…"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ordem</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                />
              </div>

              <ImageUploader
                label="Imagem de capa"
                value={form.cover_image}
                onChange={(url) => setForm((f) => ({ ...f, cover_image: url }))}
                bucket="assets"
                folder="categories"
              />

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeForm}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white hover:bg-gb-green-dark disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir categoria"
        description="Esta ação não pode ser desfeita. Categorias com figurinhas vinculadas não podem ser excluídas."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
