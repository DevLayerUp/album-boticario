"use client";

import { useState } from "react";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface Rarity {
  id: number;
  name: string;
  slug: string;
  drop_percentage: number;
  color_hex: string;
  animation_type: string;
}

const ANIMATION_TYPES = [
  { value: "none", label: "Nenhuma" },
  { value: "glow", label: "Brilho (Glow)" },
  { value: "holographic", label: "Holográfico" },
];

export function RaridadesClient({ initialData }: { initialData: Rarity[] }) {
  const [rarities, setRarities] = useState<Rarity[]>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const total = rarities.reduce((sum, r) => sum + Number(r.drop_percentage), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  function update<K extends keyof Rarity>(id: number, key: K, value: Rarity[K]) {
    setRarities((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    );
    setError(null);
    setSuccess(false);
  }

  async function handleSave() {
    if (!isValid) {
      setError(`A soma deve ser 100%. Atual: ${total.toFixed(2)}%`);
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/raridades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rarities),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Raridades</h1>
          <p className="text-sm text-gray-500">
            Configure a distribuição de figurinhas nos pacotinhos
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isValid}
          className="flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white hover:bg-gb-green-dark disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salvar
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">Raridade</th>
              <th className="px-5 py-3 text-left">% de tiragem</th>
              <th className="px-5 py-3 text-left">Cor do badge</th>
              <th className="px-5 py-3 text-left">Animação</th>
              <th className="px-5 py-3 text-left">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rarities.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900">{r.name}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={r.drop_percentage}
                      onChange={(e) =>
                        update(r.id, "drop_percentage", Number(e.target.value))
                      }
                      className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={r.color_hex}
                      onChange={(e) => update(r.id, "color_hex", e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-xs text-gray-500">{r.color_hex}</span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <select
                    value={r.animation_type}
                    onChange={(e) => update(r.id, "animation_type", e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
                  >
                    {ANIMATION_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-5 py-4">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: r.color_hex }}
                  >
                    {r.name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td className="px-5 py-3 text-sm font-semibold text-gray-700" colSpan={2}>
                <span>Total: </span>
                <span className={isValid ? "text-green-600" : "text-red-500"}>
                  {total.toFixed(2)}%
                </span>
                {isValid && <span className="ml-2 text-green-500">✓</span>}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={15} /> Raridades salvas com sucesso!
        </div>
      )}
    </div>
  );
}
