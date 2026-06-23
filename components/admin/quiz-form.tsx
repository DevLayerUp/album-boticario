"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";

interface QuizOption {
  text: string;
  is_correct: boolean;
}

interface FormData {
  question: string;
  image_url: string;
  valid_date: string;
  points: number;
  is_active: boolean;
  options: QuizOption[];
}

interface QuizFormProps {
  quizId?: number;
  initial?: Partial<FormData>;
}

const defaults: FormData = {
  question: "",
  image_url: "",
  valid_date: "",
  points: 1,
  is_active: true,
  options: [
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ],
};

export function QuizForm({ quizId, initial }: QuizFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ ...defaults, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!quizId;
  const correctCount = form.options.filter((o) => o.is_correct).length;

  function addOption() {
    setForm((f) => ({ ...f, options: [...f.options, { text: "", is_correct: false }] }));
  }

  function removeOption(idx: number) {
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));
  }

  function updateOption(idx: number, key: keyof QuizOption, value: string | boolean) {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) =>
        i === idx ? { ...o, [key]: value } : o,
      ),
    }));
    setError(null);
  }

  function setCorrect(idx: number) {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => ({ ...o, is_correct: i === idx })),
    }));
  }

  async function handleSave() {
    if (!form.question.trim()) { setError("Pergunta é obrigatória"); return; }
    if (form.options.length < 2) { setError("Mínimo 2 alternativas"); return; }
    if (correctCount !== 1) { setError("Marque exatamente 1 alternativa correta"); return; }
    if (form.options.some((o) => !o.text.trim())) { setError("Preencha todas as alternativas"); return; }

    setSaving(true);
    setError(null);
    try {
      const url = isEdit ? `/api/admin/quiz/${quizId}` : "/api/admin/quiz";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/quiz");
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
      await fetch(`/api/admin/quiz/${quizId}`, { method: "DELETE" });
      router.push("/admin/quiz");
      router.refresh();
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Editar pergunta" : "Nova pergunta"}
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
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pergunta <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.question}
              onChange={(e) => {
                setForm((f) => ({ ...f, question: e.target.value }));
                setError(null);
              }}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
              placeholder="Qual marca pertence ao Grupo Boticário?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pacotinhos ao acertar</label>
              <input
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data válida</label>
              <input
                type="date"
                value={form.valid_date}
                onChange={(e) => setForm((f) => ({ ...f, valid_date: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
              />
              <p className="mt-1 text-xs text-gray-400">
                Deixe em branco para agendar automaticamente no próximo dia livre.
              </p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="accent-gb-green"
                />
                Ativo
              </label>
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Alternativas{" "}
                <span className="text-xs font-normal text-gray-400">
                  (marque a correta)
                </span>
              </label>
              {form.options.length < 4 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-gb-green hover:underline"
                >
                  <Plus size={12} /> Adicionar
                </button>
              )}
            </div>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCorrect(idx)}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      opt.is_correct
                        ? "border-gb-green bg-gb-green text-white"
                        : "border-gray-300 text-transparent hover:border-gb-green"
                    }`}
                  >
                    <Check size={13} />
                  </button>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(idx, "text", e.target.value)}
                    placeholder={`Alternativa ${idx + 1}`}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                  />
                  {form.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.push("/admin/quiz")}
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
            {isEdit ? "Salvar alterações" : "Criar pergunta"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Excluir pergunta"
        description="Esta pergunta e todas as suas alternativas serão removidas permanentemente."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
