"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Megaphone, Pencil } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Announcement {
  id: number;
  title: string;
  body: string;
  href: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface FormState {
  title: string;
  body: string;
  href: string;
  is_active: boolean;
  expires_at: string;
}

const empty: FormState = {
  title: "",
  body: "",
  href: "",
  is_active: true,
  expires_at: "",
};

export function AvisosClient({ initialData }: { initialData: Announcement[] }) {
  const [items, setItems] = useState<Announcement[]>(initialData);
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

  function openEdit(item: Announcement) {
    setEditId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      href: item.href ?? "",
      is_active: item.is_active,
      expires_at: item.expires_at ? item.expires_at.slice(0, 16) : "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.body.trim()) {
      setError("Título e mensagem são obrigatórios");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        href: form.href.trim() || null,
        is_active: form.is_active,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };

      const res = await fetch(
        editId ? `/api/admin/avisos/${editId}` : "/api/admin/avisos",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar");
        return;
      }

      if (editId) {
        setItems((prev) => prev.map((i) => (i.id === editId ? data : i)));
      } else {
        setItems((prev) => [data, ...prev]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/avisos/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deleteId));
      }
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={openCreate}
        className="inline-flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-semibold text-white hover:bg-gb-green-dark"
      >
        <Plus size={16} />
        Novo aviso
      </button>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-900">
            {editId ? "Editar aviso" : "Novo aviso"}
          </h2>
          <div className="space-y-3">
            <input
              placeholder="Título"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Mensagem"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Link opcional (ex: /quiz)"
              value={form.href}
              onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Ativo
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-gb-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Salvar"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400">
            Nenhum aviso publicado.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-4 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Megaphone size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    {!item.is_active && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.body}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString("pt-BR")}
                    {item.href ? ` · ${item.href}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir aviso?"
        description="O aviso deixará de aparecer para os usuários."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
