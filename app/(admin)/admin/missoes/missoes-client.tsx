"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface Mission {
  id: number;
  title: string;
  description: string | null;
  type: string;
  target_value: number;
  reward_packs: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface FormState {
  title: string;
  description: string;
  type: string;
  target_value: number;
  reward_packs: number;
  is_active: boolean;
  expires_at: string;
}

const MISSION_TYPES = [
  { value: "complete_album_page", label: "Completar páginas do álbum" },
  { value: "trade_count", label: "Realizar trocas" },
  { value: "quiz_streak", label: "Acertar quizzes seguidos" },
  { value: "open_packs", label: "Abrir pacotinhos" },
  { value: "custom", label: "Manual (verificação admin)" },
];

const empty: FormState = {
  title: "",
  description: "",
  type: "custom",
  target_value: 1,
  reward_packs: 1,
  is_active: true,
  expires_at: "",
};

export function MissoesClient({ initialData }: { initialData: Mission[] }) {
  const [missions, setMissions] = useState<Mission[]>(initialData);
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

  function openEdit(m: Mission) {
    setEditId(m.id);
    setForm({
      title: m.title,
      description: m.description ?? "",
      type: m.type,
      target_value: m.target_value,
      reward_packs: m.reward_packs,
      is_active: m.is_active,
      expires_at: m.expires_at ? m.expires_at.slice(0, 16) : "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Título é obrigatório"); return; }
    setSaving(true);
    setError(null);
    try {
      const url = editId ? `/api/admin/missoes/${editId}` : "/api/admin/missoes";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, expires_at: form.expires_at || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (editId) {
        setMissions((prev) => prev.map((m) => (m.id === editId ? data : m)));
      } else {
        setMissions((prev) => [data, ...prev]);
      }
      setShowForm(false);
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
      await fetch(`/api/admin/missoes/${deleteId}`, { method: "DELETE" });
      setMissions((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  const typeLabel = (t: string) => MISSION_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Missões</h1>
          <p className="text-sm text-gray-500">{missions.length} missão(ões)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white hover:bg-gb-green-dark"
        >
          <Plus size={15} /> Nova missão
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {missions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Nenhuma missão criada. Crie a primeira!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-center">Meta</th>
                <th className="px-4 py-3 text-center">Recompensa</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {missions.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{typeLabel(m.type)}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{m.target_value}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {m.reward_packs} pack{m.reward_packs > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {m.is_active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-16">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {editId ? "Editar missão" : "Nova missão"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de missão</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                >
                  {MISSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Meta</label>
                  <input
                    type="number"
                    min={1}
                    value={form.target_value}
                    onChange={(e) => setForm((f) => ({ ...f, target_value: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Pacotinhos de recompensa</label>
                  <input
                    type="number"
                    min={1}
                    value={form.reward_packs}
                    onChange={(e) => setForm((f) => ({ ...f, reward_packs: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Expira em</label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="accent-gb-green"
                />
                Missão ativa
              </label>

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
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
        title="Excluir missão"
        description="Esta missão será removida permanentemente."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
