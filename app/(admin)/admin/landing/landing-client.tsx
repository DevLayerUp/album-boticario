"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VideoUploader } from "@/components/admin/video-uploader";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface NavLink { label: string; href: string; }

interface NavbarData {
  logoUrl:     string | null;
  fgbLogoUrl:  string | null;
  fgbLogoHref: string;
  links:       NavLink[];
  ctaLabel:    string;
  ctaHref:     string;
}

interface HeroData {
  logoUrl:       string | null;
  backgroundUrl: string | null;
  headingWhite:  string;
  headingYellow: string;
  subtitle:      string;
  ctaLabel:      string;
  ctaHref:       string;
}

interface WelcomeData {
  titleRegular: string;
  titleBold:    string;
  body:         string;
  ctaLabel:     string;
  ctaHref:      string;
  imageUrl:     string | null;
}

interface ManifestData {
  titleRegular: string;
  titleBold:    string;
  videoUrl:     string | null;
  posterUrl:    string | null;
}

interface JourneyData {
  titleRegular: string;
  titleBold:    string;
  paragraph1:   string;
  paragraph2:   string;
  ctaLabel:     string;
  ctaHref:      string;
  videoUrl:     string | null;
  posterUrl:    string | null;
}

interface HowItWorksStepData {
  iconUrl:     string | null;
  title:       string;
  description: string;
}

interface HowItWorksData {
  title: string;
  steps: HowItWorksStepData[];
}

interface RegisterData {
  backgroundUrl:       string | null;
  heading:             string;
  paragraph1:          string;
  paragraph1Highlight: string;
  paragraph2:          string;
  formTitle:           string;
  ctaLabel:            string;
  privacyUrl:          string;
}

interface FandomSocialLink {
  iconUrl: string | null;
  label:   string;
  href:    string;
}

interface FandomData {
  gifUrl?:             string | null;
  /** @deprecated legado — migrado para gifUrl ao salvar */
  card1Url?:           string | null;
  card2Url?:           string | null;
  heading:             string;
  paragraph1:          string;
  paragraph2:          string;
  paragraph2Highlight: string;
  paragraph3:          string;
  ctaLabel:            string;
  ctaHref:             string;
  socialLinks:         FandomSocialLink[];
}

interface FaqItemData {
  question: string;
  answer:   string;
}

interface FaqData {
  eyebrow: string;
  title:   string;
  items:   FaqItemData[];
}

interface FooterNavLinkData {
  label:        string;
  href:         string;
  showChevron?: boolean;
}

interface FooterNavItemData {
  kind:       "group" | "link";
  title?:     string;
  titleHref?: string;
  label?:     string;
  href?:      string;
  links?:     FooterNavLinkData[];
}

interface FooterNavColumnData {
  items: FooterNavItemData[];
}

interface FooterSocialLinkData {
  platform?: "youtube" | "linkedin" | "instagram" | "facebook" | "tiktok";
  label:   string;
  href:    string;
}

interface FooterData {
  logoUrl:        string | null;
  logoHref:       string;
  waveTopUrl:     string | null;
  patternUrl:     string | null;
  socialLinks:    FooterSocialLinkData[];
  navColumns:     FooterNavColumnData[];
  backToTopLabel: string;
}

interface Props {
  initialNavbar:     NavbarData;
  initialHero:       HeroData;
  initialWelcome:    WelcomeData;
  initialManifest:   ManifestData;
  initialJourney:    JourneyData;
  initialHowItWorks: HowItWorksData;
  initialRegister:   RegisterData;
  initialFandom:     FandomData;
  initialFaq:        FaqData;
  initialFooter:     FooterData;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
async function saveKey(key: string, value: unknown) {
  const res = await fetch("/api/admin/app-settings", {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ key, value: JSON.stringify(value) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
}

/* ─── Save button ────────────────────────────────────────────────────────── */
function SaveRow({
  saving,
  saved,
  dirty,
  error,
  onSave,
}: {
  saving: boolean;
  saved:  boolean;
  dirty:  boolean;
  error:  string | null;
  onSave: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-5">
      <button
        onClick={onSave}
        disabled={saving || !dirty}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-gb-green px-6 text-sm font-semibold text-white transition hover:bg-gb-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
        {saving ? "Salvando…" : saved ? "Salvo!" : "Salvar alterações"}
      </button>
      {!dirty && !saving && (
        <p className="text-sm text-gray-400">Sem alterações pendentes.</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */
function Section({
  title,
  subtitle,
  children,
}: {
  title:    string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

/* ─── Field ──────────────────────────────────────────────────────────────── */
function Field({
  label,
  hint,
  children,
}: {
  label:    string;
  hint?:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  className?:   string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20 ${className}`}
    />
  );
}

/* ─── Navbar section ─────────────────────────────────────────────────────── */
function NavbarSection({ initial }: { initial: NavbarData }) {
  const [data,    setData]    = useState<NavbarData>(initial);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  function updateLink(i: number, field: keyof NavLink, val: string) {
    setData((d) => {
      const links = [...d.links];
      links[i] = { ...links[i], [field]: val };
      return { ...d, links };
    });
  }

  function addLink() {
    setData((d) => ({ ...d, links: [...d.links, { label: "", href: "#" }] }));
  }

  function removeLink(i: number) {
    setData((d) => ({ ...d, links: d.links.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_navbar", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Navbar"
      subtitle="Logos, links de navegação e botão de chamada para ação."
    >
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Logo Fãs por Natureza"
            hint="Logo à esquerda (PNG ou WEBP transparente). Sugerido: 290 × 146 px."
          >
            <ImageUploader
              value={data.logoUrl}
              onChange={(url) => setData((d) => ({ ...d, logoUrl: url }))}
              bucket="landing"
              folder="navbar/fans"
              label="Logo Fãs por Natureza"
              priority
            />
          </Field>

          <Field
            label="Logo Fundação Grupo Boticário"
            hint="Segundo logo, após o divisor. Sugerido: 182 × 66 px."
          >
            <ImageUploader
              value={data.fgbLogoUrl}
              onChange={(url) => setData((d) => ({ ...d, fgbLogoUrl: url }))}
              bucket="landing"
              folder="navbar/fgb"
              label="Logo FGB"
              priority
            />
          </Field>
        </div>

        <Field label="Link do logo FGB">
          <Input
            value={data.fgbLogoHref}
            onChange={(v) => setData((d) => ({ ...d, fgbLogoHref: v }))}
            placeholder="ex: https://fundacaogrupoboticario.org.br/"
          />
        </Field>

        {/* Nav links */}
        <Field label="Links de Navegação">
          <div className="space-y-2">
            {data.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={link.label}
                  onChange={(v) => updateLink(i, "label", v)}
                  placeholder="Texto do link"
                  className="flex-2"
                />
                <Input
                  value={link.href}
                  onChange={(v) => updateLink(i, "href", v)}
                  placeholder="href (ex: #album ou /registro)"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remover link"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {data.links.length < 5 && (
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 text-xs font-medium text-gb-green hover:text-gb-green-dark"
              >
                <Plus size={13} />
                Adicionar link
              </button>
            )}
          </div>
        </Field>

        {/* CTA */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão CTA">
            <Input
              value={data.ctaLabel}
              onChange={(v) => setData((d) => ({ ...d, ctaLabel: v }))}
              placeholder="ex: Quero participar!"
            />
          </Field>
          <Field label="Link do botão CTA">
            <Input
              value={data.ctaHref}
              onChange={(v) => setData((d) => ({ ...d, ctaHref: v }))}
              placeholder="ex: /register"
            />
          </Field>
        </div>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Hero section ───────────────────────────────────────────────────────── */
function HeroSection({ initial }: { initial: HeroData }) {
  const [data,   setData]   = useState<HeroData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_hero", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Hero"
      subtitle="Seção principal da landing page: fundo, logo, título, subtítulo e CTA."
    >
      <div className="space-y-6">
        {/* Images row */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Imagem de fundo"
            hint="Imagem exibida como fundo da seção hero. Recomendado: 1920 × 780 px (JPG ou WEBP)."
          >
            <ImageUploader
              value={data.backgroundUrl}
              onChange={(url) => setData((d) => ({ ...d, backgroundUrl: url }))}
              bucket="landing"
              folder="hero/background"
              label="Fundo da Hero"
              maxSizeBytes={10 * 1024 * 1024}
            />
          </Field>

          <Field
            label="Logo"
            hint="Logo exibida acima do título (PNG transparente). Dimensões sugeridas: 410 × 206 px."
          >
            <ImageUploader
              value={data.logoUrl}
              onChange={(url) => setData((d) => ({ ...d, logoUrl: url }))}
              bucket="landing"
              folder="hero/logo"
              label="Logo da Hero"
            />
          </Field>
        </div>

        {/* Heading */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título — parte branca" hint="Exibida em branco.">
            <Input
              value={data.headingWhite}
              onChange={(v) => setData((d) => ({ ...d, headingWhite: v }))}
              placeholder="ex: Colecione a natureza."
            />
          </Field>
          <Field label="Título — parte amarela" hint="Exibida em amarelo, em destaque.">
            <Input
              value={data.headingYellow}
              onChange={(v) => setData((d) => ({ ...d, headingYellow: v }))}
              placeholder="ex: Descubra o Brasil."
            />
          </Field>
        </div>

        {/* Subtitle */}
        <Field label="Subtítulo">
          <textarea
            value={data.subtitle}
            onChange={(e) => setData((d) => ({ ...d, subtitle: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        {/* CTA */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão CTA">
            <Input
              value={data.ctaLabel}
              onChange={(v) => setData((d) => ({ ...d, ctaLabel: v }))}
              placeholder="ex: Quero meu álbum"
            />
          </Field>
          <Field label="Link do botão CTA">
            <Input
              value={data.ctaHref}
              onChange={(v) => setData((d) => ({ ...d, ctaHref: v }))}
              placeholder="ex: /register"
            />
          </Field>
        </div>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Welcome section ────────────────────────────────────────────────────── */
function WelcomeSection({ initial }: { initial: WelcomeData }) {
  const [data,   setData]   = useState<WelcomeData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_welcome", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Boas-vindas"
      subtitle="Segunda seção da landing: texto com destaque e imagem ao lado (Figma 2330:246)."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título (parte regular)">
            <Input
              value={data.titleRegular}
              onChange={(v) => setData((d) => ({ ...d, titleRegular: v }))}
              placeholder="ex: Vista o orgulho e "
            />
          </Field>
          <Field label="Título (parte em negrito)">
            <Input
              value={data.titleBold}
              onChange={(v) => setData((d) => ({ ...d, titleBold: v }))}
              placeholder="ex: vibre pela nossa natureza"
            />
          </Field>
        </div>

        <Field
          label="Texto"
          hint="Uma linha por parágrafo. A linha vertical decorativa é aplicada automaticamente no layout."
        >
          <textarea
            value={data.body}
            onChange={(e) => setData((d) => ({ ...d, body: e.target.value }))}
            rows={10}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão CTA">
            <Input
              value={data.ctaLabel}
              onChange={(v) => setData((d) => ({ ...d, ctaLabel: v }))}
              placeholder="ex: Faça parte do Fandom"
            />
          </Field>
          <Field label="Link do botão CTA">
            <Input
              value={data.ctaHref}
              onChange={(v) => setData((d) => ({ ...d, ctaHref: v }))}
              placeholder="ex: #fandom"
            />
          </Field>
        </div>

        <Field
          label="Imagem"
          hint="Imagem à direita da seção. Recomendado: 677 × 553 px."
        >
          <ImageUploader
            value={data.imageUrl}
            onChange={(url) => setData((d) => ({ ...d, imageUrl: url }))}
            bucket="landing"
            folder="welcome/image"
            label="Imagem de boas-vindas"
          />
        </Field>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Manifest video section ─────────────────────────────────────────────── */
function ManifestSection({ initial }: { initial: ManifestData }) {
  const [data,   setData]   = useState<ManifestData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_manifest", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Vídeo manifesto"
      subtitle="Terceira seção da landing: título e vídeo horizontal em destaque (Figma 2330:258)."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título (parte regular)">
            <Input
              value={data.titleRegular}
              onChange={(v) => setData((d) => ({ ...d, titleRegular: v }))}
              placeholder="ex: O mundo tem sede"
            />
          </Field>
          <Field label="Título (parte em negrito)">
            <Input
              value={data.titleBold}
              onChange={(v) => setData((d) => ({ ...d, titleBold: v }))}
              placeholder="ex: de mudança"
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Vídeo"
            hint="Vídeo horizontal (MP4, WebM ou MOV). Recomendado: 16:9, máx. 50 MB."
          >
            <VideoUploader
              value={data.videoUrl}
              onChange={(url) => setData((d) => ({ ...d, videoUrl: url }))}
              bucket="landing"
              folder="manifest/video"
            />
          </Field>

          <Field
            label="Capa do vídeo (opcional)"
            hint="Imagem exibida antes de dar play. Se vazio, usa o primeiro frame do vídeo."
          >
            <ImageUploader
              value={data.posterUrl}
              onChange={(url) => setData((d) => ({ ...d, posterUrl: url }))}
              bucket="landing"
              folder="manifest/poster"
              label="Poster do vídeo"
            />
          </Field>
        </div>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Journey section ────────────────────────────────────────────────────── */
function JourneySection({ initial }: { initial: JourneyData }) {
  const [data,   setData]   = useState<JourneyData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_journey", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Jornada pela biodiversidade"
      subtitle="Quinta seção da landing: vídeo vertical à esquerda e texto com CTA à direita (Figma 2330:272)."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título (parte regular)">
            <Input
              value={data.titleRegular}
              onChange={(v) => setData((d) => ({ ...d, titleRegular: v }))}
              placeholder="ex: Uma jornada pela"
            />
          </Field>
          <Field label="Título (parte em negrito)">
            <Input
              value={data.titleBold}
              onChange={(v) => setData((d) => ({ ...d, titleBold: v }))}
              placeholder="ex: nossa biodiversidade"
            />
          </Field>
        </div>

        <Field label="Primeiro parágrafo">
          <textarea
            value={data.paragraph1}
            onChange={(e) => setData((d) => ({ ...d, paragraph1: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <Field label="Segundo parágrafo">
          <textarea
            value={data.paragraph2}
            onChange={(e) => setData((d) => ({ ...d, paragraph2: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão CTA">
            <Input
              value={data.ctaLabel}
              onChange={(v) => setData((d) => ({ ...d, ctaLabel: v }))}
              placeholder="ex: Comece a colecionar agora!"
            />
          </Field>
          <Field label="Link do botão CTA">
            <Input
              value={data.ctaHref}
              onChange={(v) => setData((d) => ({ ...d, ctaHref: v }))}
              placeholder="ex: /register"
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Vídeo"
            hint="Vídeo vertical (MP4, WebM ou MOV). Recomendado: 399 × 709 px, máx. 50 MB."
          >
            <VideoUploader
              value={data.videoUrl}
              onChange={(url) => setData((d) => ({ ...d, videoUrl: url }))}
              bucket="landing"
              folder="journey/video"
            />
          </Field>

          <Field
            label="Capa do vídeo (opcional)"
            hint="Imagem exibida antes de dar play. Se vazio, usa o primeiro frame do vídeo."
          >
            <ImageUploader
              value={data.posterUrl}
              onChange={(url) => setData((d) => ({ ...d, posterUrl: url }))}
              bucket="landing"
              folder="journey/poster"
              label="Poster do vídeo"
            />
          </Field>
        </div>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── How it works section ───────────────────────────────────────────────── */
function HowItWorksSection({ initial }: { initial: HowItWorksData }) {
  const [data,   setData]   = useState<HowItWorksData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  function updateStep(i: number, field: keyof HowItWorksStepData, val: string | null) {
    setData((d) => {
      const steps = [...d.steps];
      steps[i] = { ...steps[i], [field]: val };
      return { ...d, steps };
    });
  }

  function addStep() {
    setData((d) => ({
      ...d,
      steps: [...d.steps, { iconUrl: null, title: "", description: "" }],
    }));
  }

  function removeStep(i: number) {
    setData((d) => ({ ...d, steps: d.steps.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_how_it_works", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Como funciona"
      subtitle="Carrossel de passos com ícone, título e descrição."
    >
      <div className="space-y-6">
        <Field label="Título da seção">
          <Input
            value={data.title}
            onChange={(v) => setData((d) => ({ ...d, title: v }))}
            placeholder="ex: Como funciona?"
          />
        </Field>

        <Field label="Passos">
          <div className="space-y-6">
            {data.steps.map((step, i) => (
              <div
                key={i}
                className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Passo {i + 1}</p>
                  {data.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remover passo ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <Field
                  label="Ícone"
                  hint="PNG ou WEBP com fundo transparente. Dimensões sugeridas: 126 × 115 px."
                >
                  <ImageUploader
                    value={step.iconUrl}
                    onChange={(url) => updateStep(i, "iconUrl", url)}
                    bucket="landing"
                    folder={`how-it-works/step-${i + 1}`}
                    label={`Ícone do passo ${i + 1}`}
                  />
                </Field>

                <Field label="Título do passo">
                  <Input
                    value={step.title}
                    onChange={(v) => updateStep(i, "title", v)}
                    placeholder="ex: Faça seu cadastro"
                  />
                </Field>

                <Field label="Descrição">
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(i, "description", e.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:ring-2 focus:ring-gb-green/20"
                  />
                </Field>
              </div>
            ))}

            {data.steps.length < 6 && (
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1.5 text-xs font-medium text-gb-green hover:text-gb-green-dark"
              >
                <Plus size={13} />
                Adicionar passo
              </button>
            )}
          </div>
        </Field>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Register section ───────────────────────────────────────────────────── */
function RegisterSection({ initial }: { initial: RegisterData }) {
  const [data,   setData]   = useState<RegisterData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_register", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Cadastro"
      subtitle="Seção com formulário de pré-cadastro sobre fundo verde escuro (Figma 2310:281)."
    >
      <div className="space-y-6">
        <Field
          label="Imagem de fundo"
          hint="Textura ou imagem exibida com 10% de opacidade sobre o fundo verde. Recomendado: 1920 × 920 px (JPG ou WEBP)."
        >
          <ImageUploader
            value={data.backgroundUrl}
            onChange={(url) => setData((d) => ({ ...d, backgroundUrl: url }))}
            bucket="landing"
            folder="register/background"
            label="Fundo da seção de Cadastro"
            maxSizeBytes={10 * 1024 * 1024}
          />
        </Field>

        <Field label="Título (amarelo)">
          <Input
            value={data.heading}
            onChange={(v) => setData((d) => ({ ...d, heading: v }))}
            placeholder="ex: Entre para o nosso Fandom agora!"
          />
        </Field>

        <Field label="Primeiro parágrafo">
          <textarea
            value={data.paragraph1}
            onChange={(e) => setData((d) => ({ ...d, paragraph1: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <Field label="Destaque em negrito (primeiro parágrafo)">
          <Input
            value={data.paragraph1Highlight}
            onChange={(v) => setData((d) => ({ ...d, paragraph1Highlight: v }))}
            placeholder="ex: acesso ao nosso álbum digital"
          />
        </Field>

        <Field label="Segundo parágrafo">
          <textarea
            value={data.paragraph2}
            onChange={(e) => setData((d) => ({ ...d, paragraph2: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <Field
          label="Título do card do formulário (opcional)"
          hint="Deixe vazio para ocultar — o layout atual do Figma não exibe título no card."
        >
          <Input
            value={data.formTitle}
            onChange={(v) => setData((d) => ({ ...d, formTitle: v }))}
            placeholder="ex: Preencha o formulário e comece a colecionar"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão de envio">
            <Input
              value={data.ctaLabel}
              onChange={(v) => setData((d) => ({ ...d, ctaLabel: v }))}
              placeholder="ex: Comece a colecionar agora!"
            />
          </Field>
          <Field label="Link da Política de Privacidade">
            <Input
              value={data.privacyUrl}
              onChange={(v) => setData((d) => ({ ...d, privacyUrl: v }))}
              placeholder="ex: /privacidade"
            />
          </Field>
        </div>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Fandom section ─────────────────────────────────────────────────────── */
function FandomSection({ initial }: { initial: FandomData }) {
  const normalizedInitial: FandomData = {
    ...initial,
    gifUrl: initial.gifUrl ?? initial.card1Url ?? null,
    card1Url: null,
  };
  const [data,   setData]   = useState<FandomData>(normalizedInitial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify({ ...data, card1Url: null }) !== JSON.stringify(normalizedInitial);

  function updateLink(i: number, field: keyof FandomSocialLink, val: string | null) {
    setData((d) => {
      const socialLinks = [...d.socialLinks];
      socialLinks[i] = { ...socialLinks[i], [field]: val };
      return { ...d, socialLinks };
    });
  }

  function addLink() {
    setData((d) => ({
      ...d,
      socialLinks: [...d.socialLinks, { iconUrl: null, label: "", href: "#" }],
    }));
  }

  function removeLink(i: number) {
    setData((d) => ({ ...d, socialLinks: d.socialLinks.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_fandom", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Faça parte do Fandom"
      subtitle="Seção com colagem de imagens, texto e links para redes sociais."
    >
      <div className="space-y-6">

        {/* Image cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="GIF — card superior-direito"
            hint="GIF animado exibido no card de cima. Recomendado: proporção 4:3. Máx. 10 MB."
          >
            <ImageUploader
              value={data.gifUrl ?? null}
              onChange={(url) => setData((d) => ({ ...d, gifUrl: url, card1Url: null }))}
              bucket="landing"
              folder="fandom/gif"
              label="GIF — Fandom"
              maxSizeBytes={10 * 1024 * 1024}
              acceptGif
            />
          </Field>
          <Field
            label="Card 2 — imagem secundária (baixo-esquerda)"
            hint="Imagem do card de fundo. Recomendado: proporção 3:2. Máx. 10 MB."
          >
            <ImageUploader
              value={data.card2Url ?? null}
              onChange={(url) => setData((d) => ({ ...d, card2Url: url }))}
              bucket="landing"
              folder="fandom/card2"
              label="Card 2 — Fandom"
              maxSizeBytes={10 * 1024 * 1024}
            />
          </Field>
        </div>

        {/* Text */}
        <Field label="Título">
          <Input
            value={data.heading}
            onChange={(v) => setData((d) => ({ ...d, heading: v }))}
            placeholder="ex: Vista a camisa e VIBRE pela nossa natureza"
          />
        </Field>

        <Field label="Parágrafo 1">
          <textarea
            value={data.paragraph1}
            onChange={(e) => setData((d) => ({ ...d, paragraph1: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <Field label="Parágrafo 2" hint="O termo definido em 'Destaque' será exibido em verde e negrito.">
          <textarea
            value={data.paragraph2}
            onChange={(e) => setData((d) => ({ ...d, paragraph2: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <Field label="Destaque no parágrafo 2" hint="Texto exato que receberá destaque em verde.">
          <Input
            value={data.paragraph2Highlight}
            onChange={(v) => setData((d) => ({ ...d, paragraph2Highlight: v }))}
            placeholder="ex: Somos Fãs por Natureza"
          />
        </Field>

        <Field label="Parágrafo 3">
          <textarea
            value={data.paragraph3}
            onChange={(e) => setData((d) => ({ ...d, paragraph3: e.target.value }))}
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:bg-white focus:ring-2 focus:ring-gb-green/20"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto do botão CTA">
            <Input
              value={data.ctaLabel}
              onChange={(v) => setData((d) => ({ ...d, ctaLabel: v }))}
              placeholder="ex: Faça parte do Fandom"
            />
          </Field>
          <Field label="Link do botão CTA">
            <Input
              value={data.ctaHref}
              onChange={(v) => setData((d) => ({ ...d, ctaHref: v }))}
              placeholder="ex: /register"
            />
          </Field>
        </div>

        {/* Social links */}
        <Field label="Redes Sociais" hint="Ícones completos (65×65 px) com fundo incluído. PNG ou WEBP. Exibidos em linha abaixo da colagem.">
          <div className="space-y-4">
            {data.socialLinks.map((link, i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Rede social {i + 1}
                  </p>
                  {data.socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remover rede social ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <Field label="Ícone" hint="Imagem completa do ícone (fundo + logo). Tamanho ideal: 65×65 px.">
                  <ImageUploader
                    value={link.iconUrl}
                    onChange={(url) => updateLink(i, "iconUrl", url)}
                    bucket="landing"
                    folder={`fandom/social-icons`}
                    label={`Ícone — ${link.label || `Rede ${i + 1}`}`}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nome da rede">
                    <Input
                      value={link.label}
                      onChange={(v) => updateLink(i, "label", v)}
                      placeholder="ex: Instagram"
                    />
                  </Field>
                  <Field label="URL do perfil">
                    <Input
                      value={link.href}
                      onChange={(v) => updateLink(i, "href", v)}
                      placeholder="ex: https://instagram.com/..."
                    />
                  </Field>
                </div>
              </div>
            ))}

            {data.socialLinks.length < 6 && (
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 text-xs font-medium text-gb-green hover:text-gb-green-dark"
              >
                <Plus size={13} />
                Adicionar rede social
              </button>
            )}
          </div>
        </Field>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── FAQ section ────────────────────────────────────────────────────────── */
function FaqSection({ initial }: { initial: FaqData }) {
  const [data,   setData]   = useState<FaqData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  function updateItem(i: number, field: keyof FaqItemData, val: string) {
    setData((d) => {
      const items = [...d.items];
      items[i] = { ...items[i], [field]: val };
      return { ...d, items };
    });
  }

  function addItem() {
    setData((d) => ({
      ...d,
      items: [...d.items, { question: "", answer: "" }],
    }));
  }

  function removeItem(i: number) {
    setData((d) => ({ ...d, items: d.items.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_faq", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="FAQ"
      subtitle="Perguntas frequentes em formato de acordeão."
    >
      <div className="space-y-6">
        <Field label="Eyebrow" hint="Texto pequeno acima do título (ex.: PERGUNTAS FREQUENTES).">
          <Input
            value={data.eyebrow}
            onChange={(v) => setData((d) => ({ ...d, eyebrow: v }))}
            placeholder="ex: PERGUNTAS FREQUENTES"
          />
        </Field>

        <Field label="Título">
          <Input
            value={data.title}
            onChange={(v) => setData((d) => ({ ...d, title: v }))}
            placeholder="ex: Perguntas frequentes"
          />
        </Field>

        <Field label="Perguntas">
          <div className="space-y-4">
            {data.items.map((item, i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Pergunta {i + 1}
                  </p>
                  {data.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remover pergunta ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <Field label="Pergunta">
                  <Input
                    value={item.question}
                    onChange={(v) => updateItem(i, "question", v)}
                    placeholder="ex: O álbum é gratuito?"
                  />
                </Field>

                <Field label="Resposta">
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateItem(i, "answer", e.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:ring-2 focus:ring-gb-green/20"
                  />
                </Field>
              </div>
            ))}

            {data.items.length < 12 && (
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-medium text-gb-green hover:text-gb-green-dark"
              >
                <Plus size={13} />
                Adicionar pergunta
              </button>
            )}
          </div>
        </Field>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Footer section ─────────────────────────────────────────────────────── */
function FooterSection({ initial }: { initial: FooterData }) {
  const [data,   setData]   = useState<FooterData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  function updateSocial(i: number, field: keyof FooterSocialLinkData, val: string) {
    setData((d) => {
      const socialLinks = [...d.socialLinks];
      socialLinks[i] = { ...socialLinks[i], [field]: val };
      return { ...d, socialLinks };
    });
  }

  function updateColumnItem(
    colIdx: number,
    itemIdx: number,
    patch: Partial<FooterNavItemData>,
  ) {
    setData((d) => {
      const navColumns = d.navColumns.map((col, ci) => {
        if (ci !== colIdx) return col;
        const items = col.items.map((item, ii) =>
          ii === itemIdx ? { ...item, ...patch } : item,
        );
        return { ...col, items };
      });
      return { ...d, navColumns };
    });
  }

  function updateGroupLink(
    colIdx: number,
    itemIdx: number,
    linkIdx: number,
    field: keyof FooterNavLinkData,
    val: string | boolean,
  ) {
    setData((d) => {
      const navColumns = d.navColumns.map((col, ci) => {
        if (ci !== colIdx) return col;
        const items = col.items.map((item, ii) => {
          if (ii !== itemIdx || !item.links) return item;
          const links = item.links.map((link, li) =>
            li === linkIdx ? { ...link, [field]: val } : link,
          );
          return { ...item, links };
        });
        return { ...col, items };
      });
      return { ...d, navColumns };
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveKey("landing_footer", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Footer"
      subtitle="Rodapé com logo, links de navegação, redes sociais e botão voltar ao topo."
    >
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Logo" hint="Logo da Fundação Grupo Boticário. Recomendado: 346×101 px.">
            <ImageUploader
              value={data.logoUrl}
              onChange={(url) => setData((d) => ({ ...d, logoUrl: url }))}
              bucket="landing"
              folder="footer/logo"
              label="Logo — Footer"
            />
          </Field>
          <Field label="Link do logo">
            <Input
              value={data.logoHref}
              onChange={(v) => setData((d) => ({ ...d, logoHref: v }))}
              placeholder="https://fundacaogrupoboticario.org.br/"
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Onda decorativa (topo)" hint="Faixa ondulada acima do footer.">
            <ImageUploader
              value={data.waveTopUrl}
              onChange={(url) => setData((d) => ({ ...d, waveTopUrl: url }))}
              bucket="landing"
              folder="footer/wave"
              label="Onda — Footer"
            />
          </Field>
          <Field label="Padrão decorativo (esquerda)" hint="Gráfico circular no canto inferior esquerdo.">
            <ImageUploader
              value={data.patternUrl}
              onChange={(url) => setData((d) => ({ ...d, patternUrl: url }))}
              bucket="landing"
              folder="footer/pattern"
              label="Padrão — Footer"
            />
          </Field>
        </div>

        <Field label="Texto do botão">
          <Input
            value={data.backToTopLabel}
            onChange={(v) => setData((d) => ({ ...d, backToTopLabel: v }))}
            placeholder="Voltar ao topo"
          />
        </Field>

        <Field label="Redes sociais" hint="Ícones renderizados automaticamente pela plataforma selecionada.">
          <div className="space-y-4">
            {data.socialLinks.map((link, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-3"
              >
                <Field label="Plataforma">
                  <select
                    value={link.platform ?? "youtube"}
                    onChange={(e) =>
                      updateSocial(i, "platform", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gb-green focus:ring-2 focus:ring-gb-green/20"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </Field>
                <Field label="Nome (acessibilidade)">
                  <Input
                    value={link.label}
                    onChange={(v) => updateSocial(i, "label", v)}
                    placeholder="ex: Instagram"
                  />
                </Field>
                <Field label="URL">
                  <Input
                    value={link.href}
                    onChange={(v) => updateSocial(i, "href", v)}
                    placeholder="https://..."
                  />
                </Field>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Colunas de navegação" hint="Edite títulos, links e URLs de cada grupo.">
          <div className="space-y-6">
            {data.navColumns.map((column, colIdx) => (
              <div
                key={colIdx}
                className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
              >
                <p className="mb-4 text-sm font-semibold text-gray-700">
                  Coluna {colIdx + 1}
                </p>
                <div className="space-y-4">
                  {column.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="space-y-3 rounded-lg border border-gray-100 bg-white p-3"
                    >
                      {item.kind === "group" ? (
                        <>
                          <Field label="Título do grupo">
                            <Input
                              value={item.title ?? ""}
                              onChange={(v) =>
                                updateColumnItem(colIdx, itemIdx, { title: v })
                              }
                            />
                          </Field>
                          <div className="space-y-2 pl-2">
                            {(item.links ?? []).map((link, linkIdx) => (
                              <div
                                key={linkIdx}
                                className="grid gap-2 sm:grid-cols-2"
                              >
                                <Input
                                  value={link.label}
                                  onChange={(v) =>
                                    updateGroupLink(colIdx, itemIdx, linkIdx, "label", v)
                                  }
                                  placeholder="Rótulo"
                                />
                                <Input
                                  value={link.href}
                                  onChange={(v) =>
                                    updateGroupLink(colIdx, itemIdx, linkIdx, "href", v)
                                  }
                                  placeholder="URL"
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            value={item.label ?? ""}
                            onChange={(v) =>
                              updateColumnItem(colIdx, itemIdx, { label: v })
                            }
                            placeholder="Link em destaque"
                          />
                          <Input
                            value={item.href ?? ""}
                            onChange={(v) =>
                              updateColumnItem(colIdx, itemIdx, { href: v })
                            }
                            placeholder="URL"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Field>
      </div>

      <SaveRow saving={saving} saved={saved} dirty={dirty} error={error} onSave={handleSave} />
    </Section>
  );
}

/* ─── Main client ────────────────────────────────────────────────────────── */
export function LandingAdminClient({
  initialNavbar,
  initialHero,
  initialWelcome,
  initialManifest,
  initialJourney,
  initialHowItWorks,
  initialRegister,
  initialFandom,
  initialFaq,
  initialFooter,
}: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Landing Page</h1>
        <p className="mt-1 text-sm text-gray-500">
          Edite o conteúdo das seções da página inicial pública.
          As alterações são aplicadas imediatamente após salvar.
        </p>
      </div>

      <NavbarSection      initial={initialNavbar} />
      <HeroSection        initial={initialHero} />
      <WelcomeSection     initial={initialWelcome} />
      <ManifestSection    initial={initialManifest} />
      <JourneySection     initial={initialJourney} />
      <HowItWorksSection  initial={initialHowItWorks} />
      <RegisterSection    initial={initialRegister} />
      <FandomSection      initial={initialFandom} />
      <FaqSection         initial={initialFaq} />
      <FooterSection      initial={initialFooter} />
    </div>
  );
}
