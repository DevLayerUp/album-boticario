"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  CONCURSO_PAGE_CONFIG_KEY,
  DEFAULT_CONCURSO_PAGE_CONFIG,
  datetimeLocalToIso,
  isoToDatetimeLocal,
  type ConcursoPageConfig,
  type ConcursoPageImages,
} from "@/lib/concurso-page";

async function saveConfig(config: ConcursoPageConfig) {
  const res = await fetch("/api/admin/app-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: CONCURSO_PAGE_CONFIG_KEY,
      value: JSON.stringify(config),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
}

export function ConcursoContentAdminClient({
  initial,
}: {
  initial: ConcursoPageConfig;
}) {
  const [config, setConfig] = useState<ConcursoPageConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(partial: Partial<ConcursoPageConfig>) {
    setConfig((current) => ({ ...current, ...partial }));
  }

  function patchImage(key: keyof ConcursoPageImages, url: string | null) {
    setConfig((current) => ({
      ...current,
      images: {
        ...current.images,
        [key]: url?.trim() ?? "",
      },
    }));
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <p className="text-sm text-gray-500">
        Textos, prazos e imagens da página <code>/concurso</code>. O layout permanece o mesmo —
        só o conteúdo muda após salvar. Remover uma imagem restaura a padrão da campanha.
      </p>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
        onReset={() => {
          setConfig(DEFAULT_CONCURSO_PAGE_CONFIG);
          setError(null);
        }}
      />

      <Section title="Visibilidade">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={config.published}
            onChange={(e) => patch({ published: e.target.checked })}
            className="mt-1 size-4 rounded border-gray-300 text-gb-green focus:ring-gb-green"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">
              Publicar para todos os usuários
            </span>
            <span className="mt-0.5 block text-sm text-gray-500">
              {config.published
                ? "A página, o menu e o card na dashboard ficam visíveis para qualquer pessoa logada."
                : "A página, o menu e o card na dashboard ficam visíveis só para administradores."}
            </span>
          </span>
        </label>
      </Section>

      <Section title="Prazos e regulamento">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Início das inscrições (Brasília)
            </span>
            <input
              type="datetime-local"
              value={isoToDatetimeLocal(config.startIso)}
              onChange={(e) => patch({ startIso: datetimeLocalToIso(e.target.value) })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Encerramento (Brasília)
            </span>
            <input
              type="datetime-local"
              value={isoToDatetimeLocal(config.deadlineIso)}
              onChange={(e) =>
                patch({ deadlineIso: datetimeLocalToIso(e.target.value, true) })
              }
              className={fieldClass}
            />
          </label>
        </div>
        <TextField
          label="URL do regulamento"
          value={config.regulamentoUrl}
          onChange={(regulamentoUrl) => patch({ regulamentoUrl })}
          hint="Vazio usa a variável de ambiente ou o site da Fundação."
        />
      </Section>

      <Section title="Hero">
        <TextField
          label="Título"
          value={config.heroTitle}
          onChange={(heroTitle) => patch({ heroTitle })}
        />
        <TextField
          label="Palavra em destaque (amarelo)"
          value={config.heroHighlight}
          onChange={(heroHighlight) => patch({ heroHighlight })}
        />
        <TextField
          label="Subtítulo"
          value={config.heroSubtitle}
          onChange={(heroSubtitle) => patch({ heroSubtitle })}
          multiline
        />
        <TextField
          label="Texto de apoio"
          value={config.heroDescription}
          onChange={(heroDescription) => patch({ heroDescription })}
          multiline
        />
        <TextField
          label="Botão"
          value={config.heroCta}
          onChange={(heroCta) => patch({ heroCta })}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ConcursoImageField
            label="Logotipos"
            imageKey="heroLogos"
            value={config.images.heroLogos}
            onChange={patchImage}
          />
          <ConcursoImageField
            label="Onda 1"
            imageKey="heroWave1"
            value={config.images.heroWave1}
            onChange={patchImage}
          />
          <ConcursoImageField
            label="Onda 2"
            imageKey="heroWave2"
            value={config.images.heroWave2}
            onChange={patchImage}
          />
          <ConcursoImageField
            label="Onda 3"
            imageKey="heroWave3"
            value={config.images.heroWave3}
            onChange={patchImage}
          />
          <ConcursoImageField
            label="Onda 4"
            imageKey="heroWave4"
            value={config.images.heroWave4}
            onChange={patchImage}
          />
        </div>
      </Section>

      <Section title="Pódio e prêmios">
        <TextField
          label="Título"
          value={config.prizesTitle}
          onChange={(prizesTitle) => patch({ prizesTitle })}
        />
        <TextField
          label="Texto introdutório"
          value={config.prizesIntro}
          onChange={(prizesIntro) => patch({ prizesIntro })}
          multiline
        />
        <TextField
          label="Pergunta em destaque"
          value={config.prizesQuestion}
          onChange={(prizesQuestion) => patch({ prizesQuestion })}
          hint="Se o texto introdutório contiver essa frase, ela aparece em verde."
        />
        <ConcursoImageField
          label="Fundo da seção"
          imageKey="prizesBackground"
          value={config.images.prizesBackground}
          onChange={patchImage}
        />
        <ConcursoImageField
          label="Camisa (pódio)"
          imageKey="prizeJersey"
          value={config.images.prizeJersey}
          onChange={patchImage}
        />
        {config.prizes.map((prize, index) => {
          const medalKey = (`medal${index + 1}` as keyof ConcursoPageImages);
          return (
            <div key={index} className="grid gap-3 rounded-xl border border-gray-100 p-4 sm:grid-cols-[160px_1fr]">
              <ConcursoImageField
                label="Medalha"
                imageKey={medalKey}
                value={config.images[medalKey]}
                onChange={patchImage}
              />
              <div className="grid gap-3">
                <TextField
                  label={`${index + 1}º — título`}
                  value={prize.place}
                  onChange={(place) => {
                    const prizes = [...config.prizes];
                    prizes[index] = { ...prize, place };
                    patch({ prizes });
                  }}
                />
                <TextField
                  label="Descrição do prêmio"
                  value={prize.copy}
                  onChange={(copy) => {
                    const prizes = [...config.prizes];
                    prizes[index] = { ...prize, copy };
                    patch({ prizes });
                  }}
                  multiline
                />
              </div>
            </div>
          );
        })}
        <TextField
          label="Texto abaixo do pódio"
          value={config.prizesFooter}
          onChange={(prizesFooter) => patch({ prizesFooter })}
          multiline
        />
        <TextField
          label="Botão"
          value={config.prizesCta}
          onChange={(prizesCta) => patch({ prizesCta })}
        />
      </Section>

      <Section title="Como funciona">
        <TextField
          label="Título"
          value={config.howTitle}
          onChange={(howTitle) => patch({ howTitle })}
        />
        <StringListEditor
          label="Itens da lista"
          values={config.howBullets}
          min={1}
          max={8}
          onChange={(howBullets) => patch({ howBullets })}
        />
        <TextField
          label="Link do regulamento"
          value={config.howRegulamentoLabel}
          onChange={(howRegulamentoLabel) => patch({ howRegulamentoLabel })}
        />
        <TextField
          label="Legenda da figurinha"
          value={config.howStickerCaption}
          onChange={(howStickerCaption) => patch({ howStickerCaption })}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <ConcursoImageField
            label="Figurinha 1"
            imageKey="sticker1"
            value={config.images.sticker1}
            onChange={patchImage}
          />
          <ConcursoImageField
            label="Figurinha 2"
            imageKey="sticker2"
            value={config.images.sticker2}
            onChange={patchImage}
          />
          <ConcursoImageField
            label="Figurinha 3"
            imageKey="sticker3"
            value={config.images.sticker3}
            onChange={patchImage}
          />
        </div>
      </Section>

      <Section title="Formulário">
        <TextField
          label="Título"
          value={config.formTitle}
          onChange={(formTitle) => patch({ formTitle })}
        />
        <TextField
          label="Subtítulo"
          value={config.formSubtitle}
          onChange={(formSubtitle) => patch({ formSubtitle })}
        />
        <TextField
          label="Pergunta"
          value={config.formQuestion}
          onChange={(formQuestion) => patch({ formQuestion })}
        />
        <TextField
          label="Texto antes do link do regulamento"
          value={config.formConsentRulesPrefix}
          onChange={(formConsentRulesPrefix) => patch({ formConsentRulesPrefix })}
        />
        <TextField
          label="Texto do link do regulamento"
          value={config.formConsentLinkLabel}
          onChange={(formConsentLinkLabel) => patch({ formConsentLinkLabel })}
        />
        <TextField
          label="Autorização de dados"
          value={config.formConsentData}
          onChange={(formConsentData) => patch({ formConsentData })}
          multiline
        />
        <TextField
          label="Botão de envio"
          value={config.formSubmitLabel}
          onChange={(formSubmitLabel) => patch({ formSubmitLabel })}
        />
        <TextField
          label="Título quando encerrado"
          value={config.formClosedTitle}
          onChange={(formClosedTitle) => patch({ formClosedTitle })}
        />
        <TextField
          label="Texto quando encerrado"
          value={config.formClosedBody}
          onChange={(formClosedBody) => patch({ formClosedBody })}
          multiline
        />
      </Section>

      <Section title="Confirmação após envio">
        <TextField
          label="Título"
          value={config.confirmTitle}
          onChange={(confirmTitle) => patch({ confirmTitle })}
        />
        <StringListEditor
          label="Parágrafos"
          values={config.confirmParagraphs}
          min={1}
          max={6}
          onChange={(confirmParagraphs) => patch({ confirmParagraphs })}
        />
        <TextField
          label="Botão"
          value={config.confirmButtonLabel}
          onChange={(confirmButtonLabel) => patch({ confirmButtonLabel })}
        />
        <ConcursoImageField
          label="Selo de sucesso"
          imageKey="successBadge"
          value={config.images.successBadge}
          onChange={patchImage}
        />
      </Section>

      <Section title="Cronômetro">
        <TextField
          label="Título"
          value={config.timelineTitle}
          onChange={(timelineTitle) => patch({ timelineTitle })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ConcursoImageField
            label="Fundo do relógio"
            imageKey="clockBadge"
            value={config.images.clockBadge}
            onChange={patchImage}
          />
          <ConcursoImageField
            label="Ícone do relógio"
            imageKey="clockIcon"
            value={config.images.clockIcon}
            onChange={patchImage}
          />
        </div>
        {config.timeline.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-xl border border-gray-100 p-4 sm:grid-cols-2">
            <TextField
              label={`Etapa ${index + 1} — título`}
              value={item.title}
              onChange={(title) => {
                const timeline = [...config.timeline];
                timeline[index] = { ...item, title };
                patch({ timeline });
              }}
            />
            <TextField
              label="Texto"
              value={item.body}
              onChange={(body) => {
                const timeline = [...config.timeline];
                timeline[index] = { ...item, body };
                patch({ timeline });
              }}
              multiline
            />
          </div>
        ))}
      </Section>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
        onReset={() => {
          setConfig(DEFAULT_CONCURSO_PAGE_CONFIG);
          setError(null);
        }}
      />
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gb-green focus:outline-none focus:ring-1 focus:ring-gb-green";

function ConcursoImageField({
  label,
  imageKey,
  value,
  onChange,
}: {
  label: string;
  imageKey: keyof ConcursoPageImages;
  value: string;
  onChange: (key: keyof ConcursoPageImages, url: string | null) => void;
}) {
  return (
    <ImageUploader
      label={label}
      value={value}
      onChange={(url) => onChange(imageKey, url)}
      bucket="assets"
      folder={`concurso/${imageKey}`}
      acceptSvg
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
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
          className={fieldClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
      )}
      {hint ? <span className="block text-xs text-gray-400">{hint}</span> : null}
    </label>
  );
}

function StringListEditor({
  label,
  values,
  min,
  max,
  onChange,
}: {
  label: string;
  values: string[];
  min: number;
  max: number;
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <textarea
            value={value}
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              onChange(next);
            }}
            rows={2}
            className={fieldClass}
          />
          {values.length > min ? (
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              aria-label={`Remover item ${index + 1}`}
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      ))}
      {values.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gb-green hover:underline"
        >
          <Plus size={14} />
          Adicionar item
        </button>
      ) : null}
    </div>
  );
}

function SaveBar({
  saving,
  saved,
  error,
  onSave,
  onReset,
}: {
  saving: boolean;
  saved: boolean;
  error: string | null;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-3">
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
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gb-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gb-green-dark disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Salvar alterações
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Restaurar padrão
        </button>
      </div>
    </div>
  );
}
