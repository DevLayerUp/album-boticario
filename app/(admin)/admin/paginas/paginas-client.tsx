"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { AdminStorageImage } from "@/components/admin/admin-storage-image";
import {
  Plus, Trash2, BookOpen, Layers, Settings2, Save, X,
  Loader2, CheckCircle2, FileText, ImageIcon, Upload, PenLine, Hash,
} from "lucide-react";
import { TemplatePicker } from "@/components/admin/template-picker";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  TEMPLATE_MAP, type TemplateId,
  parseLayoutData, type Title3Data,
  isProfileTemplate, hasRichTextContent,
} from "@/lib/album-templates";

interface Category { id: number; name: string }
interface PageRow {
  id: number;
  page_number: number;
  title: string | null;
  background_url: string | null;
  layout_template: string;
  category_id: number;
  slot_count: number;
  page_type: "sticker" | "info";
  content: string | null;
}
interface SlotRow {
  id: number;
  slot_number: number;
  sticker_id: number | null;
  stickers: { id: number; name: string; image_url: string; rarities: { name: string; color_hex: string } | null } | null;
}
interface StickerOption {
  id: number;
  name: string;
  image_url: string;
  rarities: { name: string; color_hex: string } | null;
}

interface PaginasClientProps {
  initialCategories: Category[];
  initialPages: PageRow[];
}

const EMPTY_FORM = {
  category_id: 0,
  page_number: 1,
  title: "",
  background_url: "",
  layout_template: "title3" as TemplateId,
  page_type: "sticker" as "sticker" | "info",
};

// ─── Slot configurator modal ──────────────────────────────────────────────────
function SlotConfigModal({
  page,
  onClose,
}: {
  page: PageRow;
  onClose: (saved: boolean) => void;
}) {
  const [slots, setSlots]               = useState<SlotRow[]>([]);
  const [stickerOptions, setStickerOptions] = useState<StickerOption[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [error, setError]               = useState("");
  const [assignments, setAssignments]   = useState<Map<number, number | null>>(new Map());
  const [search, setSearch]             = useState("");

  const template = TEMPLATE_MAP[page.layout_template as TemplateId];
  const isProfile = isProfileTemplate(page.layout_template);

  const loadData = useCallback(async () => {
    if (isProfile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [slotsRes, stickersRes] = await Promise.all([
        fetch(`/api/admin/paginas/slots?page_id=${page.id}`),
        fetch("/api/admin/figurinhas?active=true&is_user_type=false"),
      ]);
      const slotsData    = slotsRes.ok    ? await slotsRes.json()    : [];
      const stickersData = stickersRes.ok ? await stickersRes.json() : [];

      setSlots(slotsData);
      setStickerOptions(stickersData);

      const map = new Map<number, number | null>();
      for (const s of slotsData as SlotRow[]) map.set(s.id, s.sticker_id);
      setAssignments(map);
    } finally {
      setLoading(false);
    }
  }, [page.id, isProfile]);

  useEffect(() => { loadData(); }, [loadData]);

  function setSlotSticker(slotId: number, stickerId: number | null) {
    setAssignments((prev) => new Map(prev).set(slotId, stickerId));
    setSaved(false);
  }

  async function handleSave() {
    if (isProfile || slots.length === 0) {
      onClose(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = Array.from(assignments.entries()).map(([slot_id, sticker_id]) => ({ slot_id, sticker_id }));
      const res = await fetch("/api/admin/paginas/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: payload }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao salvar"); return; }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const filteredOptions = search.trim()
    ? stickerOptions.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : stickerOptions;

  const stickerById    = new Map(stickerOptions.map((s) => [s.id, s]));
  const assignedCount  = Array.from(assignments.values()).filter((v) => v !== null).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      onClick={() => onClose(saved)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-gb-ink">
              Configurar Slots — Página {page.page_number}{page.title ? `: ${page.title}` : ""}
            </h2>
            <p className="text-sm text-muted">{assignedCount}/{slots.length} slots com figurinha atribuída</p>
          </div>
          <button onClick={() => onClose(saved)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 size={28} className="animate-spin text-gb-green/50" /></div>
        ) : isProfile ? (
          <div className="p-6">
            <p className="text-sm text-gray-600">
              Esta página usa o template <strong>Minha Figurinha</strong>. Não há slots de catálogo —
              cada usuário vê a figurinha personalizada criada com a foto em <strong>/figurinha</strong>.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Use o botão de lápis para editar apenas o título da página.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-500">
              Para cada slot do layout <strong>{page.layout_template}</strong>, escolha qual figurinha deve ocupar aquela posição.
            </p>
            <input
              type="text"
              placeholder="Buscar figurinha pelo nome…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gb-green"
            />
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${template?.cols ?? 3}, 1fr)` }}
            >
              {slots.map((slot) => {
                const assignedId      = assignments.get(slot.id) ?? null;
                const assignedSticker = assignedId ? stickerById.get(assignedId) : null;
                return (
                  <div
                    key={slot.id}
                    className={`relative flex flex-col overflow-hidden rounded-xl border-2 transition-colors ${
                      assignedSticker ? "border-gb-green/60 bg-gb-green/5" : "border-dashed border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-border/50 px-2 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Slot #{slot.slot_number}</span>
                      {assignedSticker && (
                        <button onClick={() => setSlotSticker(slot.id, null)} title="Remover atribuição" className="text-gray-300 hover:text-red-400">
                          <X size={11} />
                        </button>
                      )}
                    </div>
                    {assignedSticker ? (
                      <div className="flex items-center gap-2 p-2">
                        <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-lg">
                          <Image src={assignedSticker.image_url} alt={assignedSticker.name} fill className="object-cover" sizes="32px" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-gb-ink leading-tight">{assignedSticker.name}</p>
                          {assignedSticker.rarities && (
                            <span className="inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white" style={{ backgroundColor: assignedSticker.rarities.color_hex }}>
                              {assignedSticker.rarities.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="px-2 py-3 text-center text-[10px] text-gray-400">Sem figurinha</p>
                    )}
                    <div className="border-t border-border/50 px-2 py-1.5">
                      <select
                        value={assignedId ?? ""}
                        onChange={(e) => setSlotSticker(slot.id, e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border border-border bg-white px-1.5 py-1 text-[11px] outline-none focus:border-gb-green"
                      >
                        <option value="">— nenhuma —</option>
                        {filteredOptions.map((s) => <option key={s.id} value={s.id}>#{s.id} {s.name}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
            {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {saved ? (
            <span className="flex items-center gap-2 text-sm font-medium text-gb-green"><CheckCircle2 size={16} /> Salvo com sucesso!</span>
          ) : (
            <span className="text-sm text-gray-400">{assignedCount} de {slots.length} slots configurados</span>
          )}
          <div className="flex gap-3">
            <button onClick={() => onClose(saved)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Fechar</button>
            {!isProfile && (
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gb-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Salvando…" : "Salvar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Info page editor modal ───────────────────────────────────────────────────
function InfoPageEditorModal({
  page,
  onClose,
}: {
  page: PageRow;
  onClose: (updated?: Partial<PageRow>) => void;
}) {
  const [title, setTitle]          = useState(page.title ?? "");
  const [content, setContent]      = useState(page.content ?? "");
  const [imageUrl, setImageUrl]    = useState(page.background_url ?? "");
  const [uploading, setUploading]  = useState(false);
  const [saving, setSaving]        = useState(false);
  const [saved, setSaved]          = useState(false);
  const [error, setError]          = useState("");
  const [activeTab, setActiveTab]  = useState<"edit" | "preview">("edit");
  const fileInputRef               = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/page-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao enviar imagem"); return; }
      setImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/paginas/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:          title || null,
          background_url: imageUrl || null,
          content:        content || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao salvar"); return; }
      setSaved(true);
      setTimeout(() => onClose({ title: title || null, background_url: imageUrl || null, content: content || null }), 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8" onClick={() => onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <FileText size={16} />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-gb-ink">
                Editar Página Informativa — Pág. {page.page_number}
              </h2>
              <p className="text-xs text-muted">Imagem de destaque + conteúdo HTML</p>
            </div>
          </div>
          <button onClick={() => onClose()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {(["edit", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`-mb-px mr-4 border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === t
                  ? "border-gb-green text-gb-green"
                  : "border-transparent text-muted hover:text-gb-ink"
              }`}
            >
              {t === "edit" ? "✏️ Editar" : "👁 Visualizar"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {activeTab === "edit" ? (
            <>
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Título da Página</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
                  placeholder="ex: História da Marca"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gb-green"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Imagem de Destaque</label>
                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 transition-colors hover:border-gb-green/50">
                  {imageUrl ? (
                    <div className="relative">
                      <div className="relative h-40 w-full">
                        <AdminStorageImage src={imageUrl} alt="Imagem da página" fill className="object-contain rounded-xl" sizes="700px" />
                      </div>
                      <button
                        onClick={() => { setImageUrl(""); setSaved(false); }}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex w-full flex-col items-center gap-2 py-8 text-center"
                    >
                      {uploading ? (
                        <Loader2 size={28} className="animate-spin text-gb-green/50" />
                      ) : (
                        <Upload size={28} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-500">
                        {uploading ? "Enviando…" : "Clique para enviar uma imagem"}
                      </span>
                      <span className="text-xs text-gray-400">JPG, PNG, WebP — máx. 5 MB</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                {/* or paste URL */}
                <div className="mt-2 flex items-center gap-2">
                  <ImageIcon size={14} className="shrink-0 text-gray-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setSaved(false); }}
                    placeholder="Ou cole uma URL de imagem…"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-gb-green"
                  />
                </div>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Conteúdo HTML</label>
                <RichTextEditor
                  value={content}
                  onChange={(html) => { setContent(html); setSaved(false); }}
                  minHeight={240}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Use a barra de formatação para criar cabeçalhos, listas, negrito, etc.
                </p>
              </div>
            </>
          ) : (
            /* ── Preview tab ── */
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="relative">
                {imageUrl && (
                  <div className="relative h-48 w-full">
                    <AdminStorageImage src={imageUrl} alt={title || "Imagem"} fill className="object-contain" sizes="700px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {title && (
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="font-display text-xl font-bold text-white drop-shadow">{title}</h2>
                      </div>
                    )}
                  </div>
                )}
                {!imageUrl && title && (
                  <div className="bg-gb-green/10 px-6 py-4">
                    <h2 className="font-display text-xl font-bold text-gb-ink">{title}</h2>
                  </div>
                )}
              </div>
              <div
                className="prose prose-sm max-w-none p-6"
                dangerouslySetInnerHTML={{ __html: content || "<p class=\"text-gray-400 italic\">Sem conteúdo ainda.</p>" }}
              />
            </div>
          )}

          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {saved ? (
            <span className="flex items-center gap-2 text-sm font-medium text-gb-green"><CheckCircle2 size={16} /> Salvo!</span>
          ) : (
            <span className="text-sm text-gray-400">Página informativa</span>
          )}
          <div className="flex gap-3">
            <button onClick={() => onClose()} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Fechar</button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-2 rounded-xl bg-gb-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Salvando…" : "Salvar Conteúdo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout content editor for sticker pages ─────────────────────────────────
function LayoutContentModal({
  page,
  onClose,
}: {
  page: PageRow;
  onClose: (updated?: Partial<PageRow>) => void;
}) {
  const isTitle3      = page.layout_template === "title3";
  const isGrid6       = page.layout_template === "grid6";
  const hasRichText   = hasRichTextContent(page.layout_template);
  const isProfile     = isProfileTemplate(page.layout_template);
  const initial       = parseLayoutData(page.content) as Title3Data;

  const [title,    setTitle]    = useState(initial.title    ?? page.title ?? "");
  const [text,     setText]     = useState(hasRichText ? (initial.text ?? "") : "");
  const [imageUrl, setImageUrl] = useState(isTitle3 ? (initial.image_url ?? page.background_url ?? "") : "");
  const [uploading, setUploading] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const fileRef                 = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    setUploading(true); setError("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res  = await fetch("/api/admin/upload/page-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao enviar imagem"); return; }
      setImageUrl(data.url); setSaved(false);
    } finally { setUploading(false); }
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const layoutData: Title3Data & { title?: string } = { title: title || undefined };
      if (hasRichText && text) layoutData.text = text;
      if (isTitle3 && imageUrl) layoutData.image_url = imageUrl;

      const res = await fetch(`/api/admin/paginas/${page.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ layout_data: layoutData }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao salvar"); return; }
      setSaved(true);
      setTimeout(() => onClose({ title: title || null, content: JSON.stringify(layoutData) }), 700);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8" onClick={() => onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gb-green/10 text-gb-green">
              <PenLine size={16} />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-gb-ink">
                Editar Conteúdo — Pág. {page.page_number}
                {page.title ? ` · ${page.title}` : ""}
              </h2>
              <p className="text-xs text-muted">
                {isTitle3
                  ? "Título, texto e imagem opcional"
                  : isGrid6
                    ? "Título e texto abaixo das figurinhas"
                    : isProfile
                      ? "Título da página (a figurinha vem da foto do usuário)"
                      : "Título da página"}
              </p>
            </div>
          </div>
          <button onClick={() => onClose()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Título da Página
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
              placeholder="ex: Perfumes Clássicos"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gb-green"
            />
          </div>

          {/* Rich text — title3 and grid6 */}
          {hasRichText && !isTitle3 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Texto da Página
              </label>
              <RichTextEditor
                value={text}
                onChange={(html) => { setText(html); setSaved(false); }}
                minHeight={200}
              />
              <p className="mt-1 text-xs text-gray-400">
                Este texto aparece abaixo do título, depois das figurinhas.
              </p>
            </div>
          )}

          {/* Image + rich text — only for title3 */}
          {isTitle3 && (
            <>
              {/* Image */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Imagem de Destaque (opcional)
                </label>
                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 transition-colors hover:border-gb-green/50">
                  {imageUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Imagem" className="h-32 w-full rounded-xl object-cover" />
                      <button
                        onClick={() => { setImageUrl(""); setSaved(false); }}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex w-full flex-col items-center gap-2 py-6 text-center"
                    >
                      {uploading ? (
                        <Loader2 size={24} className="animate-spin text-gb-green/50" />
                      ) : (
                        <Upload size={24} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-500">
                        {uploading ? "Enviando…" : "Clique para enviar uma imagem"}
                      </span>
                      <span className="text-xs text-gray-400">JPG, PNG, WebP — máx. 5 MB</span>
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ImageIcon size={13} className="shrink-0 text-gray-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setSaved(false); }}
                    placeholder="Ou cole uma URL de imagem…"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-gb-green"
                  />
                </div>
              </div>

              {/* Rich text */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Texto da Página
                </label>
                <RichTextEditor
                  value={text}
                  onChange={(html) => { setText(html); setSaved(false); }}
                  minHeight={200}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Este texto aparece abaixo do título, antes das figurinhas.
                </p>
              </div>
            </>
          )}

          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          {saved ? (
            <span className="flex items-center gap-2 text-sm font-medium text-gb-green"><CheckCircle2 size={16} /> Salvo!</span>
          ) : (
            <span className="text-sm text-gray-400">Template: {page.layout_template}</span>
          )}
          <div className="flex gap-3">
            <button onClick={() => onClose()} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Fechar</button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-2 rounded-xl bg-gb-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Salvando…" : "Salvar Conteúdo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page number editor ───────────────────────────────────────────────────────
function PageNumberModal({
  page,
  pages,
  onClose,
}: {
  page: PageRow;
  pages: PageRow[];
  onClose: (updated?: number) => void;
}) {
  const [pageNumber, setPageNumber] = useState(page.page_number);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState("");

  const duplicate = pages.some(
    (p) => p.id !== page.id && p.category_id === page.category_id && p.page_number === pageNumber,
  );

  async function handleSave() {
    if (pageNumber < 1 || !Number.isInteger(pageNumber)) {
      setError("Informe um número inteiro maior que zero");
      return;
    }
    if (duplicate) {
      setError("Já existe outra página com este número nesta categoria");
      return;
    }
    if (pageNumber === page.page_number) {
      onClose();
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/paginas/${page.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ page_number: pageNumber }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao salvar"); return; }
      setSaved(true);
      setTimeout(() => onClose(pageNumber), 600);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Hash size={16} />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-gb-ink">Numeração da Página</h2>
              <p className="text-xs text-muted truncate max-w-[200px]">
                {page.title ? page.title : `ID ${page.id}`}
              </p>
            </div>
          </div>
          <button onClick={() => onClose()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Número da Página
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={pageNumber}
              onChange={(e) => { setPageNumber(Number(e.target.value)); setSaved(false); setError(""); }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gb-green"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Define a ordem desta página dentro da categoria no álbum.
            </p>
          </div>

          {duplicate && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Outra página nesta categoria já usa o número {pageNumber}.
            </p>
          )}
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {saved ? (
            <span className="flex items-center gap-2 text-sm font-medium text-gb-green">
              <CheckCircle2 size={16} /> Salvo!
            </span>
          ) : (
            <span className="text-sm text-gray-400">Atual: {page.page_number}</span>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onClose()}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || duplicate}
              className="flex items-center gap-2 rounded-xl bg-gb-green px-5 py-2 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PaginasClient({ initialCategories, initialPages }: PaginasClientProps) {
  const [pages, setPages]              = useState<PageRow[]>(initialPages);
  const [showForm, setShowForm]        = useState(false);
  const [form, setForm]                = useState({ ...EMPTY_FORM });
  const [saving, setSaving]            = useState(false);
  const [deleteId, setDeleteId]        = useState<number | null>(null);
  const [catFilter, setCatFilter]      = useState<number | "all">("all");
  const [error, setError]              = useState("");
  const [configPage, setConfigPage]        = useState<PageRow | null>(null);
  const [infoEditPage, setInfoEditPage]    = useState<PageRow | null>(null);
  const [contentEditPage, setContentEditPage] = useState<PageRow | null>(null);
  const [numberEditPage, setNumberEditPage]   = useState<PageRow | null>(null);

  const categories = initialCategories;

  const filtered =
    catFilter === "all" ? pages : pages.filter((p) => p.category_id === catFilter);

  const grouped = categories
    .map((cat) => ({ cat, pages: filtered.filter((p) => p.category_id === cat.id) }))
    .filter((g) => catFilter === "all" || g.cat.id === catFilter);

  function openForm() {
    const catId  = catFilter !== "all" ? catFilter : (categories[0]?.id ?? 0);
    const existing = pages.filter((p) => p.category_id === catId);
    const nextNum  = existing.length > 0 ? Math.max(...existing.map((p) => p.page_number)) + 1 : 1;
    setForm({ ...EMPTY_FORM, category_id: catId, page_number: nextNum });
    setError("");
    setShowForm(true);
  }

  async function handleCreate() {
    if (!form.category_id) { setError("Selecione uma categoria"); return; }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        category_id:  form.category_id,
        page_number:  form.page_number,
        title:        form.title || null,
        page_type:    form.page_type,
      };

      if (form.page_type === "sticker") {
        payload.background_url  = form.background_url || null;
        payload.layout_template = form.layout_template;
      }

      const res = await fetch("/api/admin/paginas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar página"); return; }

      const template  = TEMPLATE_MAP[form.layout_template];
      const newPage: PageRow = {
        ...data,
        slot_count: form.page_type === "sticker" ? (template?.total ?? 0) : 0,
        page_type:  form.page_type,
        content:    null,
      };

      setPages((prev) => [...prev, newPage]);
      setShowForm(false);

      // Auto-open appropriate editor
      if (form.page_type === "info") {
        setInfoEditPage(newPage);
      } else if (
        isProfileTemplate(form.layout_template) ||
        hasRichTextContent(form.layout_template)
      ) {
        setContentEditPage(newPage);
      } else {
        setConfigPage(newPage);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/paginas/${id}`, { method: "DELETE" });
    if (res.ok) setPages((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gb-green/10 text-gb-green">
            <BookOpen size={18} />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-gb-ink">Páginas do Álbum</h1>
            <p className="text-sm text-muted">{pages.length} páginas cadastradas</p>
          </div>
        </div>
        <button
          onClick={openForm}
          disabled={categories.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gb-green px-4 py-2 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-40"
        >
          <Plus size={16} /> Nova Página
        </button>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCatFilter("all")}
            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
              catFilter === "all" ? "border-gb-green bg-gb-green text-white" : "border-border text-muted hover:border-gb-green/40"
            }`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                catFilter === c.id ? "border-gb-green bg-gb-green text-white" : "border-border text-muted hover:border-gb-green/40"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700">
          Crie categorias primeiro em <strong>Categorias</strong> antes de adicionar páginas.
        </div>
      )}

      {/* Info box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <strong>Como funciona:</strong> Crie páginas de <strong>Figurinhas</strong> (grid de slots) ou <strong>Informativas</strong> (imagem + texto). Cada par de páginas forma uma abertura do álbum.
      </div>

      {/* Pages grouped by category */}
      {grouped.map(({ cat, pages: catPages }) => (
        <div key={cat.id} className="overflow-hidden rounded-2xl border border-border">
          <div className="flex items-center justify-between border-b border-border bg-gray-50 px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gb-ink">
              <Layers size={15} className="text-gb-green" />
              {cat.name}
            </div>
            <span className="rounded-full bg-gb-green/10 px-2.5 py-0.5 text-xs font-semibold text-gb-green-dark">
              {catPages.length} páginas
            </span>
          </div>

          {catPages.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">Nenhuma página. Clique em &quot;Nova Página&quot;.</p>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 lg:grid-cols-3">
              {catPages.map((p) => {
                const isInfo    = p.page_type === "info";
                const isProfile = isProfileTemplate(p.layout_template);
                const tpl       = TEMPLATE_MAP[p.layout_template as TemplateId];
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-4">
                    {/* Mini preview */}
                    {isInfo ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-500">
                        <FileText size={16} />
                      </div>
                    ) : isProfile ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <div className="h-7 w-5 rounded-[2px] bg-gb-green/40" />
                      </div>
                    ) : p.layout_template === "tri3" ? (
                      <div className="flex h-9 w-9 shrink-0 items-center gap-px rounded-lg bg-gb-green/5 p-1">
                        <div className="h-[70%] w-[38%] rounded-[2px] bg-gb-green/30" />
                        <div className="flex h-full flex-1 flex-col justify-center gap-px">
                          <div className="flex-1 rounded-[2px] bg-gb-green/30" />
                          <div className="flex-1 rounded-[2px] bg-gb-green/30" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="grid shrink-0 gap-0.5"
                        style={{
                          gridTemplateColumns: `repeat(${tpl?.cols ?? 3}, 1fr)`,
                          width: 36,
                          height: tpl ? 36 * (tpl.rows / tpl.cols) : 36,
                        }}
                      >
                        {Array.from({ length: tpl?.total ?? 9 }).map((_, i) => (
                          <div key={i} className="rounded-[2px] bg-gb-green/25" />
                        ))}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gb-ink">
                        Pág. {p.page_number}{p.title ? ` — ${p.title}` : ""}
                      </p>
                      <p className="text-xs text-muted">
                        {isInfo ? (
                          <span className="inline-flex items-center gap-1 text-violet-600">
                            <FileText size={10} /> Informativa
                          </span>
                        ) : isProfile ? (
                          <span className="text-amber-700">Minha Figurinha · foto do usuário</span>
                        ) : (
                          `${p.layout_template} · ${p.slot_count} slots`
                        )}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <button
                      onClick={() => setNumberEditPage(p)}
                      title="Editar numeração"
                      className="shrink-0 rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"
                    >
                      <Hash size={15} />
                    </button>
                    {isInfo ? (
                      <button
                        onClick={() => setInfoEditPage(p)}
                        title="Editar conteúdo"
                        className="shrink-0 rounded-lg p-1.5 text-violet-500 hover:bg-violet-50"
                      >
                        <Settings2 size={15} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setContentEditPage(p)}
                          title="Editar título e texto"
                          className="shrink-0 rounded-lg p-1.5 text-blue-500 hover:bg-blue-50"
                        >
                          <PenLine size={15} />
                        </button>
                        {!isProfile && (
                          <button
                            onClick={() => setConfigPage(p)}
                            title="Configurar slots"
                            className="shrink-0 rounded-lg p-1.5 text-gb-green hover:bg-gb-green/10"
                          >
                            <Settings2 size={15} />
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* ── Create page modal ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative flex max-h-[min(90vh,820px)] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-gb-ink">Nova Página do Álbum</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {/* Page type toggle */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo de Página</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "sticker", icon: Layers,   label: "Figurinhas",   desc: "Grid com slots para colar figurinhas" },
                    { value: "info",    icon: FileText,  label: "Informativa",  desc: "Imagem de destaque + conteúdo HTML" },
                  ] as const).map(({ value, icon: Icon, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, page_type: value }))}
                      className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
                        form.page_type === value
                          ? value === "sticker"
                            ? "border-gb-green bg-gb-green/5"
                            : "border-violet-400 bg-violet-50"
                          : "border-border hover:border-gray-300"
                      }`}
                    >
                      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${
                        form.page_type === value
                          ? value === "sticker" ? "bg-gb-green text-white" : "bg-violet-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <Icon size={15} />
                      </div>
                      <span className="text-sm font-semibold text-gb-ink">{label}</span>
                      <span className="mt-0.5 text-xs text-muted">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template picker — right after type so it's always visible */}
              {form.page_type === "sticker" && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Layout da Página — quantas figurinhas por página
                  </label>
                  <TemplatePicker
                    value={form.layout_template}
                    onChange={(id) => setForm((f) => ({ ...f, layout_template: id }))}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    {form.layout_template === "profile"
                      ? "Exibe a figurinha personalizada que cada usuário cria com sua foto — sem slots de catálogo."
                      : `${TEMPLATE_MAP[form.layout_template]?.total ?? 9} slots serão criados automaticamente.`}
                  </p>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Categoria</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gb-green"
                >
                  <option value={0}>Selecione…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Número da Página</label>
                  <input
                    type="number" min={1}
                    value={form.page_number}
                    onChange={(e) => setForm((f) => ({ ...f, page_number: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gb-green"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Título (opcional)</label>
                  <input
                    type="text" placeholder="ex: Perfumes Clássicos"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gb-green"
                  />
                </div>
              </div>

              {form.page_type === "info" && (
                <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                  Após criar, um editor será aberto para você inserir a <strong>imagem</strong> e o <strong>conteúdo HTML</strong> da página.
                </div>
              )}

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="rounded-xl bg-gb-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-gb-green-dark disabled:opacity-60"
              >
                {saving ? "Criando…" : "Criar Página →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slot configurator modal ─────────────────────────────────────────── */}
      {configPage && (
        <SlotConfigModal page={configPage} onClose={() => setConfigPage(null)} />
      )}

      {/* ── Info page editor modal ─────────────────────────────────────────── */}
      {infoEditPage && (
        <InfoPageEditorModal
          page={infoEditPage}
          onClose={(updated) => {
            if (updated) {
              setPages((prev) =>
                prev.map((p) =>
                  p.id === infoEditPage.id ? { ...p, ...updated } : p
                )
              );
            }
            setInfoEditPage(null);
          }}
        />
      )}

      {/* ── Sticker page layout content modal ──────────────────────────────── */}
      {contentEditPage && (
        <LayoutContentModal
          page={contentEditPage}
          onClose={(updated) => {
            if (updated) {
              setPages((prev) =>
                prev.map((p) =>
                  p.id === contentEditPage.id ? { ...p, ...updated } : p
                )
              );
            }
            setContentEditPage(null);
          }}
        />
      )}

      {/* ── Page number modal ──────────────────────────────────────────────── */}
      {numberEditPage && (
        <PageNumberModal
          page={numberEditPage}
          pages={pages}
          onClose={(newNumber) => {
            if (newNumber !== undefined) {
              setPages((prev) =>
                prev
                  .map((p) =>
                    p.id === numberEditPage.id ? { ...p, page_number: newNumber } : p
                  )
                  .sort((a, b) =>
                    a.category_id !== b.category_id
                      ? a.category_id - b.category_id
                      : a.page_number - b.page_number
                  )
              );
            }
            setNumberEditPage(null);
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir página?"
        description={`Esta ação remove a página${
          pages.find((p) => p.id === deleteId)?.page_type === "sticker"
            ? ` e todos os ${pages.find((p) => p.id === deleteId)?.slot_count ?? 0} slots`
            : ""
        }. Esta ação não pode ser desfeita.`}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
