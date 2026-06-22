"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  createEmptyFirstStep,
  DEFAULT_FIRST_STEPS_CONFIG,
  FIRST_STEPS_MAX,
  FIRST_STEPS_MIN,
  type FirstStepsBadgeVariant,
  type FirstStepsConfig,
  type FirstStepsPanelTheme,
  type FirstStepsStepConfig,
} from "@/lib/first-steps";

interface FirstStepsAdminClientProps {
  initial: FirstStepsConfig;
}

async function saveConfig(config: FirstStepsConfig) {
  const res = await fetch("/api/admin/app-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "first_steps_config",
      value: JSON.stringify(config),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
}

function TextField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gb-green focus:outline-none focus:ring-1 focus:ring-gb-green";

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

function StepEditor({
  index,
  step,
  onChange,
  onRemove,
}: {
  index: number;
  step: FirstStepsStepConfig;
  onChange: (step: FirstStepsStepConfig) => void;
  onRemove?: () => void;
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Passo {index + 1}</h2>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label={`Remover passo ${index + 1}`}
          >
            <Trash2 size={16} aria-hidden />
            Remover
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Título"
          value={step.title}
          onChange={(title) => onChange({ ...step, title })}
        />
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tema do painel
          </span>
          <select
            value={step.panelTheme}
            onChange={(e) =>
              onChange({ ...step, panelTheme: e.target.value as FirstStepsPanelTheme })
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="verde-escuro">Verde escuro</option>
            <option value="amarelo">Amarelo</option>
            <option value="verde">Verde</option>
          </select>
        </label>
      </div>

      <TextField
        label="Descrição"
        value={step.description}
        onChange={(description) => onChange({ ...step, description })}
        multiline
      />

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Badge do passo
        </span>
        <select
          value={step.badgeVariant}
          onChange={(e) =>
            onChange({ ...step, badgeVariant: e.target.value as FirstStepsBadgeVariant })
          }
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="light">Claro (texto verde claro)</option>
          <option value="dark">Escuro (texto verde escuro)</option>
        </select>
      </label>

      <div className="space-y-3 border-t border-gray-100 pt-4">
        <ImageUploader
          label="Imagem de fundo do painel"
          value={step.backgroundImage}
          onChange={(backgroundImage) => onChange({ ...step, backgroundImage })}
          bucket="assets"
          folder={`first-steps/step-${index + 1}`}
        />
      </div>
    </section>
  );
}

export function FirstStepsAdminClient({ initial }: FirstStepsAdminClientProps) {
  const [config, setConfig] = useState<FirstStepsConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateStep(index: number, step: FirstStepsStepConfig) {
    setConfig((current) => {
      const steps = [...current.steps];
      steps[index] = step;
      return { ...current, steps };
    });
  }

  function addStep() {
    setConfig((current) => {
      if (current.steps.length >= FIRST_STEPS_MAX) return current;
      return {
        ...current,
        steps: [...current.steps, createEmptyFirstStep(current.steps.length)],
      };
    });
  }

  function removeStep(index: number) {
    setConfig((current) => {
      if (current.steps.length <= FIRST_STEPS_MIN) return current;
      return {
        ...current,
        steps: current.steps.filter((_, i) => i !== index),
      };
    });
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
    setConfig(DEFAULT_FIRST_STEPS_CONFIG);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Primeiros Passos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure o modal exibido na primeira visita ao dashboard após o login.
          Textos e imagens são aplicados imediatamente após salvar.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Geral
        </h2>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="size-4 rounded border-gray-300 text-gb-green focus:ring-gb-green"
          />
          <span className="text-sm text-gray-700">Exibir modal para novos usuários</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Link pular introdução"
            value={config.skipLabel}
            onChange={(skipLabel) => setConfig({ ...config, skipLabel })}
          />
          <TextField
            label="Rodapé"
            value={config.footerText}
            onChange={(footerText) => setConfig({ ...config, footerText })}
          />
          <TextField
            label="Botão voltar"
            value={config.backLabel}
            onChange={(backLabel) => setConfig({ ...config, backLabel })}
          />
          <TextField
            label="Botão avançar"
            value={config.nextLabel}
            onChange={(nextLabel) => setConfig({ ...config, nextLabel })}
          />
          <TextField
            label="Botão final"
            value={config.finishLabel}
            onChange={(finishLabel) => setConfig({ ...config, finishLabel })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Passos do modal
          </h2>
          <span className="text-xs text-gray-400">
            {config.steps.length} de {FIRST_STEPS_MAX}
          </span>
        </div>

        {config.steps.map((step, index) => (
          <StepEditor
            key={index}
            index={index}
            step={step}
            onChange={(s) => updateStep(index, s)}
            onRemove={
              config.steps.length > FIRST_STEPS_MIN
                ? () => removeStep(index)
                : undefined
            }
          />
        ))}

        {config.steps.length < FIRST_STEPS_MAX ? (
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gb-green transition-colors hover:border-gb-green hover:bg-gb-green/5"
          >
            <Plus size={16} aria-hidden />
            Adicionar passo
          </button>
        ) : null}
      </section>

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
