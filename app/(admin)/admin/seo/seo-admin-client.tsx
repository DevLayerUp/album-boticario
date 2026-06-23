"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { AdminStorageImage } from "@/components/admin/admin-storage-image";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  DEFAULT_SEO_SETTINGS,
  resolveAppPageFullTitle,
  resolveSeoRoute,
  SEO_APP_PAGE_LABELS,
  SEO_ROUTE_LABELS,
  SEO_SETTINGS_KEY,
  type SeoAppPageKey,
  type SeoRouteConfig,
  type SeoRouteKey,
  type SeoSettings,
  type SeoTwitterCard,
} from "@/lib/seo-settings";

interface SeoAdminClientProps {
  initial: SeoSettings;
}

type TabId = "global" | "appPages" | SeoRouteKey;

const TABS: { id: TabId; label: string }[] = [
  { id: "global", label: "Geral" },
  { id: "appPages", label: "Área logada" },
  ...(
    Object.entries(SEO_ROUTE_LABELS) as [
      SeoRouteKey,
      { label: string; path: string; usesTitleTemplate: boolean },
    ][]
  ).map(([id, { label }]) => ({ id, label })),
];

const inputClassName =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gb-green focus:outline-none focus:ring-1 focus:ring-gb-green";

function TextField({
  label,
  hint,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={inputClassName}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
      )}
    </label>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  return (
    <p className={`text-right text-xs ${over ? "text-amber-600" : "text-gray-400"}`}>
      {len}/{max} caracteres{over ? " — pode ser cortado no Google" : ""}
    </p>
  );
}

function GoogleSerpPreview({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://exemplo.com";
  const displayUrl = `${origin.replace(/^https?:\/\//, "")}${path}`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        Prévia no Google
      </p>
      <div className="mt-3 space-y-1 font-[Arial,sans-serif]">
        <p className="truncate text-sm text-[#202124]">{displayUrl}</p>
        <p className="line-clamp-1 text-xl leading-snug text-[#1a0dab]">{title}</p>
        <p className="line-clamp-2 text-sm leading-relaxed text-[#4d5156]">{description}</p>
      </div>
    </div>
  );
}

function BrowserTabPreview({ title }: { title: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
      <p className="border-b border-gray-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        Prévia da aba do navegador
      </p>
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="size-3 shrink-0 rounded-full bg-gray-300" aria-hidden />
        <p className="truncate text-sm text-gray-700">{title}</p>
      </div>
    </div>
  );
}

function SharePreview({
  title,
  description,
  imageUrl,
  siteName,
}: {
  title: string;
  description: string;
  imageUrl: string | null;
  siteName: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {imageUrl ? (
          <div className="relative aspect-[1.91/1] w-full bg-gray-100">
            <AdminStorageImage
              src={imageUrl}
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
        ) : (
          <div className="flex aspect-[1.91/1] items-center justify-center bg-gray-100 px-4 text-center text-sm text-gray-400">
            Sem imagem OG — recomendado 1200×630 px
          </div>
        )}
        <div className="space-y-1 p-4">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            {siteName || "site.com"}
          </p>
          <p className="line-clamp-2 text-sm font-semibold text-gray-900">{title}</p>
          <p className="line-clamp-2 text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function RouteEditor({
  routeKey,
  route,
  settings,
  onChange,
}: {
  routeKey: SeoRouteKey;
  route: SeoRouteConfig;
  settings: SeoSettings;
  onChange: (route: SeoRouteConfig) => void;
}) {
  const { path, usesTitleTemplate } = SEO_ROUTE_LABELS[routeKey];
  const preview = resolveSeoRoute(
    { ...settings, routes: { ...settings.routes, [routeKey]: route } },
    routeKey,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <GoogleSerpPreview
          title={preview.fullTitle}
          description={preview.metaDescription}
          path={path}
        />
        <BrowserTabPreview title={preview.fullTitle} />
      </div>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {SEO_ROUTE_LABELS[routeKey].label}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Rota{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{path}</code>
            {" · "}
            Campos vazios usam os valores globais da aba Geral.
          </p>
        </div>

        <div className="space-y-4 border-b border-gray-100 pb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Aba do navegador
          </h3>
          <TextField
            label="Título curto da aba"
            hint={
              usesTitleTemplate
                ? `Combinado com o modelo global: ${settings.titleTemplate}`
                : "Na landing, este é o título completo exibido na aba."
            }
            value={route.tabTitle}
            onChange={(tabTitle) => onChange({ ...route, tabTitle })}
            placeholder={
              routeKey === "home" ? settings.defaultTitle : "Ex.: Entrar"
            }
          />
          <BrowserTabPreview title={preview.fullTitle} />
        </div>

        <div className="space-y-4 border-b border-gray-100 pb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Google e buscadores
          </h3>
          <TextField
            label="Título no Google (opcional)"
            hint="Se vazio, usa o título da aba (com sufixo do site, quando aplicável). Ideal: até 60 caracteres."
            value={route.seoTitle}
            onChange={(seoTitle) => onChange({ ...route, seoTitle })}
            placeholder={preview.fullTitle}
          />
          <CharCount value={route.seoTitle || preview.fullTitle} max={60} />
          <TextField
            label="Descrição no Google"
            hint="Texto exibido abaixo do título nos resultados de busca. Ideal: até 160 caracteres."
            value={route.metaDescription}
            onChange={(metaDescription) => onChange({ ...route, metaDescription })}
            multiline
            placeholder={settings.defaultDescription}
          />
          <CharCount
            value={route.metaDescription || settings.defaultDescription}
            max={160}
          />
          <GoogleSerpPreview
            title={preview.fullTitle}
            description={preview.metaDescription}
            path={path}
          />
        </div>

        <div className="space-y-4 border-b border-gray-100 pb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Compartilhamento (WhatsApp, redes sociais)
          </h3>
          <SharePreview
            title={preview.ogTitle}
            description={preview.ogDescription}
            imageUrl={preview.ogImageUrl}
            siteName={settings.siteName}
          />
          <ImageUploader
            label="Imagem ao compartilhar (og:image)"
            value={route.ogImageUrl}
            onChange={(ogImageUrl) => onChange({ ...route, ogImageUrl })}
            bucket="assets"
            folder="seo"
          />
          <TextField
            label="Título ao compartilhar (opcional)"
            hint="Se vazio, usa o título do Google."
            value={route.ogTitle}
            onChange={(ogTitle) => onChange({ ...route, ogTitle })}
          />
          <TextField
            label="Descrição ao compartilhar (opcional)"
            hint="Se vazia, usa a descrição do Google."
            value={route.ogDescription}
            onChange={(ogDescription) => onChange({ ...route, ogDescription })}
            multiline
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={route.noIndex}
            onChange={(e) => onChange({ ...route, noIndex: e.target.checked })}
            className="size-4 rounded border-gray-300 text-gb-green focus:ring-gb-green"
          />
          <span className="text-sm text-gray-700">
            Ocultar esta página dos buscadores (noindex)
          </span>
        </label>
      </section>
    </div>
  );
}

function AppPagesEditor({
  settings,
  onChange,
}: {
  settings: SeoSettings;
  onChange: (page: SeoAppPageKey, tabTitle: string) => void;
}) {
  const appKeys = Object.keys(SEO_APP_PAGE_LABELS) as SeoAppPageKey[];

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Títulos da área logada
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Define apenas o texto da aba do navegador nas páginas após o login.
            O sufixo segue o modelo global ({settings.titleTemplate}). Essas páginas
            não são indexadas no Google.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {appKeys.map((key) => {
            const { label, path } = SEO_APP_PAGE_LABELS[key];
            const tabTitle = settings.appPages[key].tabTitle;
            const fullTitle = resolveAppPageFullTitle(settings, key);

            return (
              <div
                key={key}
                className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{path}</p>
                </div>
                <TextField
                  label="Título da aba"
                  value={tabTitle}
                  onChange={(value) => onChange(key, value)}
                  placeholder={label}
                />
                <BrowserTabPreview title={fullTitle} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function SeoAdminClient({ initial }: SeoAdminClientProps) {
  const [settings, setSettings] = useState<SeoSettings>(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(initial));
  const [activeTab, setActiveTab] = useState<TabId>("global");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(settings) !== savedSnapshot;

  const globalPreview = useMemo(
    () => resolveSeoRoute(settings, "home"),
    [settings],
  );

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/app-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: SEO_SETTINGS_KEY,
          value: JSON.stringify(settings),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
      setSavedSnapshot(JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function updateRoute(key: SeoRouteKey, route: SeoRouteConfig) {
    setSettings((prev) => ({
      ...prev,
      routes: { ...prev.routes, [key]: route },
    }));
  }

  function updateAppPage(key: SeoAppPageKey, tabTitle: string) {
    setSettings((prev) => ({
      ...prev,
      appPages: {
        ...prev.appPages,
        [key]: { tabTitle },
      },
    }));
  }

  function handleReset() {
    setSettings(DEFAULT_SEO_SETTINGS);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO e compartilhamento</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure títulos, descrições e a imagem exibida quando o link é compartilhado
          em redes sociais, WhatsApp e buscadores. As alterações são aplicadas após salvar.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <nav
          className="flex flex-wrap gap-1"
          aria-label="Seções de SEO"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-gb-green/10 text-gb-green"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {activeTab === "global" ? (
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Prévia ao compartilhar
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Visualização com os valores globais (landing usa a aba específica).
              </p>
            </div>
            <SharePreview
              title={globalPreview.ogTitle}
              description={globalPreview.ogDescription}
              imageUrl={globalPreview.ogImageUrl}
              siteName={settings.siteName}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Identidade do site
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Nome do site"
                hint="Usado em Open Graph (og:site_name)."
                value={settings.siteName}
                onChange={(siteName) => setSettings((p) => ({ ...p, siteName }))}
              />
              <TextField
                label="Cor do tema"
                hint="Barra do navegador em dispositivos móveis."
                value={settings.themeColor}
                onChange={(themeColor) => setSettings((p) => ({ ...p, themeColor }))}
                placeholder="#0d6632"
              />
            </div>
            <TextField
              label="Título padrão (fallback)"
              hint="Usado quando uma página não define título próprio."
              value={settings.defaultTitle}
              onChange={(defaultTitle) => setSettings((p) => ({ ...p, defaultTitle }))}
            />
            <TextField
              label="Modelo de título da aba"
              hint="Sufixo das páginas internas. Use %s para o título curto. Ex.: %s · Álbum Grupo Boticário"
              value={settings.titleTemplate}
              onChange={(titleTemplate) => setSettings((p) => ({ ...p, titleTemplate }))}
            />
            <TextField
              label="Descrição padrão no Google"
              hint="Meta description usada quando a página não define descrição própria."
              value={settings.defaultDescription}
              onChange={(defaultDescription) =>
                setSettings((p) => ({ ...p, defaultDescription }))
              }
              multiline
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Compartilhamento global
            </h2>
            <p className="text-sm text-gray-500">
              Imagem padrão ao compartilhar links. Recomendado: 1200×630 px (PNG ou JPG).
              Usada quando a página não define imagem própria.
            </p>
            <ImageUploader
              label="Imagem padrão (og:image)"
              value={settings.defaultOgImageUrl}
              onChange={(defaultOgImageUrl) =>
                setSettings((p) => ({ ...p, defaultOgImageUrl }))
              }
              bucket="assets"
              folder="seo"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Card do Twitter
                </span>
                <select
                  value={settings.twitterCard}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      twitterCard: e.target.value as SeoTwitterCard,
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="summary_large_image">Imagem grande</option>
                  <option value="summary">Resumo (imagem pequena)</option>
                </select>
              </label>
              <TextField
                label="Twitter @site (opcional)"
                value={settings.twitterSite}
                onChange={(twitterSite) => setSettings((p) => ({ ...p, twitterSite }))}
                placeholder="@grupoboticario"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Favicon e indexação
            </h2>
            <ImageUploader
              label="Favicon"
              value={settings.faviconUrl}
              onChange={(faviconUrl) => setSettings((p) => ({ ...p, faviconUrl }))}
              bucket="assets"
              folder="seo"
            />
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.robotsIndex}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, robotsIndex: e.target.checked }))
                  }
                  className="size-4 rounded border-gray-300 text-gb-green focus:ring-gb-green"
                />
                <span className="text-sm text-gray-700">Permitir indexação (index)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.robotsFollow}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, robotsFollow: e.target.checked }))
                  }
                  className="size-4 rounded border-gray-300 text-gb-green focus:ring-gb-green"
                />
                <span className="text-sm text-gray-700">Permitir seguir links (follow)</span>
              </label>
            </div>
          </section>
        </div>
      ) : activeTab === "appPages" ? (
        <AppPagesEditor
          settings={settings}
          onChange={updateAppPage}
        />
      ) : (
        <RouteEditor
          routeKey={activeTab}
          route={settings.routes[activeTab]}
          settings={settings}
          onChange={(route) => updateRoute(activeTab, route)}
        />
      )}

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
          disabled={saving || !isDirty}
          className="inline-flex items-center gap-2 rounded-lg bg-gb-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gb-green-dark disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Restaurar padrão
        </button>
        {!isDirty && !saving ? (
          <p className="text-sm text-gray-400">Sem alterações pendentes.</p>
        ) : null}
      </div>
    </div>
  );
}
