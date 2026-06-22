"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  DASHBOARD_CARD_LABELS,
  DASHBOARD_FEATURE_CARDS_KEY,
  DEFAULT_DASHBOARD_FEATURE_CARDS,
  type DashboardFeatureCardsConfig,
} from "@/lib/dashboard-feature-cards";
import { dashboardAssets, type DashboardCardKey } from "@/lib/dashboard-assets";

const CARD_KEYS = Object.keys(
  DASHBOARD_CARD_LABELS,
) as DashboardCardKey[];

interface DashboardCardsAdminClientProps {
  initial: DashboardFeatureCardsConfig;
}

async function saveConfig(config: DashboardFeatureCardsConfig) {
  const res = await fetch("/api/admin/app-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: DASHBOARD_FEATURE_CARDS_KEY,
      value: JSON.stringify(config),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
}

export function DashboardCardsAdminClient({
  initial,
}: DashboardCardsAdminClientProps) {
  const [config, setConfig] = useState<DashboardFeatureCardsConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateCard(key: DashboardCardKey, url: string | null) {
    setConfig((current) => ({ ...current, [key]: url }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setConfig(DEFAULT_DASHBOARD_FEATURE_CARDS);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cards da Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Imagens de fundo dos cards da seção &quot;Explorar&quot; na página inicial
          do álbum. Arquivos são armazenados no Supabase Storage (bucket{" "}
          <code>assets</code>).
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {CARD_KEYS.map((key) => (
          <section
            key={key}
            className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 className="font-semibold text-gray-900">
                {DASHBOARD_CARD_LABELS[key]}
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Padrão: {dashboardAssets.cards[key]}
              </p>
            </div>
            <ImageUploader
              label="Imagem de fundo"
              value={config[key]}
              onChange={(url) => updateCard(key, url)}
              bucket="assets"
              folder={`dashboard/cards/${key}`}
            />
          </section>
        ))}
      </div>

      {error ? (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={16} />
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="flex items-center gap-2 text-sm font-medium text-gb-green">
          <Check size={16} />
          Salvo com sucesso!
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gb-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gb-green-dark disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Salvar alterações
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Restaurar padrão
        </button>
      </div>
    </div>
  );
}
