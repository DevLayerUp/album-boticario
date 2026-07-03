"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Mail,
  Pencil,
  Send,
  Eye,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CampaignEmailPreviewModal } from "@/components/admin/campaign-email-preview-modal";
import {
  CampaignUserSearch,
  formatUserLabel,
} from "@/components/admin/campaign-user-search";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { CampaignUserSearchResult } from "@/lib/email/campaign-user-search";
import {
  AUDIENCE_GROUPS,
  AUDIENCE_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  audienceRequiresMission,
  audienceRequiresUser,
  resolveAudienceLabel,
  type CampaignMissionOption,
  type EmailCampaign,
  type EmailCampaignAudience,
  type EmailCampaignCategory,
  type EmailCampaignStatus,
} from "@/lib/email/campaign-types";

interface FormState {
  title: string;
  category: EmailCampaignCategory;
  audience: EmailCampaignAudience;
  mission_id: string;
  selected_user: CampaignUserSearchResult | null;
  html_body: string;
  scheduled_at: string;
  status: "draft" | "scheduled";
}

const empty: FormState = {
  title: "",
  category: "aviso",
  audience: "marketing_opt_in",
  mission_id: "",
  selected_user: null,
  html_body: "",
  scheduled_at: "",
  status: "draft",
};

function userFromAudienceFilter(
  audience: EmailCampaignAudience,
  filter: EmailCampaign["audience_filter"],
): CampaignUserSearchResult | null {
  if (audience !== "specific_user" || !filter?.user_id) return null;
  if (filter.user_display) {
    const sep = filter.user_display.lastIndexOf(" · ");
    if (sep > 0) {
      return {
        id: filter.user_id,
        display_name: filter.user_display.slice(0, sep),
        email: filter.user_display.slice(sep + 3),
        username: null,
      };
    }
  }
  return {
    id: filter.user_id,
    display_name: null,
    email: "",
    username: null,
  };
}

const STATUS_COLORS: Record<EmailCampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AutomacoesEmailClient({
  initialData,
  missions,
}: {
  initialData: EmailCampaign[];
  missions: CampaignMissionOption[];
}) {
  const [items, setItems] = useState<EmailCampaign[]>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchAudienceCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const params = new URLSearchParams({
        category: form.category,
        audience: form.audience,
      });
      if (form.mission_id) {
        params.set("mission_id", form.mission_id);
      }
      if (form.selected_user?.id) {
        params.set("user_id", form.selected_user.id);
      }
      const res = await fetch(`/api/admin/email-campaigns/audience-count?${params}`);
      const data = await res.json();
      setAudienceCount(res.ok ? data.count : null);
    } catch {
      setAudienceCount(null);
    } finally {
      setLoadingCount(false);
    }
  }, [form.category, form.audience, form.mission_id, form.selected_user?.id]);

  useEffect(() => {
    if (showForm) fetchAudienceCount();
  }, [showForm, fetchAudienceCount]);

  function openCreate() {
    setEditId(null);
    setForm(empty);
    setError(null);
    setShowPreviewModal(false);
    setShowForm(true);
  }

  function openEdit(item: EmailCampaign) {
    setEditId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      audience: item.audience,
      mission_id: item.audience_filter?.mission_id
        ? String(item.audience_filter.mission_id)
        : "",
      selected_user: userFromAudienceFilter(item.audience, item.audience_filter),
      html_body: item.html_body,
      scheduled_at: toDatetimeLocal(item.scheduled_at),
      status: item.status === "scheduled" ? "scheduled" : "draft",
    });
    setError(null);
    setShowPreviewModal(false);
    setShowForm(true);
  }

  function buildPayload(status: "draft" | "scheduled") {
    const audienceFilter: {
      mission_id?: number;
      user_id?: string;
      user_display?: string;
    } = {};
    if (form.mission_id) {
      audienceFilter.mission_id = Number(form.mission_id);
    }
    if (form.selected_user) {
      audienceFilter.user_id = form.selected_user.id;
      audienceFilter.user_display = formatUserLabel(form.selected_user);
    }

    return {
      title: form.title.trim(),
      category: form.category,
      audience: form.audience,
      audience_filter: audienceFilter,
      html_body: form.html_body,
      scheduled_at: form.scheduled_at
        ? new Date(form.scheduled_at).toISOString()
        : new Date().toISOString(),
      status,
    };
  }

  async function handleSave(asScheduled: boolean) {
    if (!form.title.trim()) {
      setError("Título é obrigatório");
      return;
    }
    if (!form.html_body.trim()) {
      setError("Conteúdo do e-mail é obrigatório");
      return;
    }
    if (audienceRequiresMission(form.audience) && !form.mission_id) {
      setError("Selecione uma missão para este segmento");
      return;
    }
    if (audienceRequiresUser(form.audience) && !form.selected_user) {
      setError("Selecione um usuário para este envio");
      return;
    }
    if (asScheduled && !form.scheduled_at) {
      setError("Data de envio é obrigatória para agendar");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(asScheduled ? "scheduled" : "draft");
      const res = await fetch(
        editId ? `/api/admin/email-campaigns/${editId}` : "/api/admin/email-campaigns",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
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

  async function handlePreviewSend() {
    if (!editId) {
      setError("Salve a campanha antes de enviar um teste");
      return;
    }
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${editId}/preview`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar teste");
        return;
      }
      alert(`E-mail de teste enviado para ${data.sent_to}`);
    } finally {
      setPreviewing(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems((prev) => prev.filter((i) => i.id !== deleteId));
        } else {
          setItems((prev) =>
            prev.map((i) => (i.id === deleteId ? { ...i, status: "cancelled" } : i)),
          );
        }
      }
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  const canEdit = (status: EmailCampaignStatus) =>
    status === "draft" || status === "scheduled";

  return (
    <div className="space-y-4">
      <button
        onClick={openCreate}
        className="inline-flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-semibold text-white hover:bg-gb-green-dark"
      >
        <Plus size={16} />
        Nova automação
      </button>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-900">
            {editId ? "Editar automação" : "Nova automação de e-mail"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Título (assunto do e-mail)
              </label>
              <input
                placeholder="Ex: Novidades do álbum esta semana"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as EmailCampaignCategory,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {(Object.keys(CATEGORY_LABELS) as EmailCampaignCategory[]).map((key) => (
                    <option key={key} value={key}>
                      {CATEGORY_LABELS[key]}
                    </option>
                  ))}
                </select>
                {form.category === "novidade" && (
                  <p className="mt-1 text-xs text-amber-700">
                    Novidades são enviadas apenas para usuários com marketing opt-in.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Base de leads
                </label>
                <select
                  value={form.audience}
                  onChange={(e) => {
                    const next = e.target.value as EmailCampaignAudience;
                    setForm((f) => ({
                      ...f,
                      audience: next,
                      mission_id:
                        next === "mission_incomplete" ? f.mission_id : "",
                      selected_user: next === "specific_user" ? f.selected_user : null,
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {AUDIENCE_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.audiences.map((key) => (
                        <option key={key} value={key}>
                          {AUDIENCE_LABELS[key]}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {audienceRequiresMission(form.audience) && (
                  <select
                    value={form.mission_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mission_id: e.target.value }))
                    }
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">Selecione a missão…</option>
                    {missions.map((mission) => (
                      <option key={mission.id} value={mission.id}>
                        {mission.title}
                        {!mission.is_active ? " (inativa)" : ""}
                      </option>
                    ))}
                  </select>
                )}
                {audienceRequiresUser(form.audience) && (
                  <CampaignUserSearch
                    value={form.selected_user}
                    onChange={(user) =>
                      setForm((f) => ({ ...f, selected_user: user }))
                    }
                    disabled={saving}
                  />
                )}
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Users size={12} />
                  {loadingCount ? (
                    "Calculando destinatários…"
                  ) : audienceCount !== null ? (
                    `~${audienceCount} destinatário(s)`
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Data de envio
              </label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">
                  Conteúdo do e-mail (HTML)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-gb-green hover:underline"
                >
                  <Eye size={12} />
                  Preview
                </button>
              </div>
              <RichTextEditor
                value={form.html_body}
                onChange={(html) => setForm((f) => ({ ...f, html_body: html }))}
                placeholder="Escreva o conteúdo do e-mail aqui…"
                minHeight={240}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Salvar rascunho"}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-gb-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Calendar size={14} />
                Agendar envio
              </button>
              {editId && (
                <button
                  onClick={handlePreviewSend}
                  disabled={previewing}
                  className="inline-flex items-center gap-1 rounded-lg border border-gb-green px-4 py-2 text-sm font-medium text-gb-green disabled:opacity-50"
                >
                  <Send size={14} />
                  {previewing ? "Enviando…" : "Enviar teste"}
                </button>
              )}
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600"
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
            Nenhuma automação criada.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-4 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[item.status]}`}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {CATEGORY_LABELS[item.category]} ·{" "}
                    {resolveAudienceLabel(item.audience, item.audience_filter ?? {}, missions)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Agendado: {new Date(item.scheduled_at).toLocaleString("pt-BR")}
                    {item.stats?.total != null && (
                      <> · {item.stats.sent ?? 0}/{item.stats.total} enviados</>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Link
                    href={`/admin/automacoes-email/${item.id}`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label="Ver relatório"
                    title="Ver relatório de envios"
                  >
                    <BarChart3 size={14} />
                  </Link>
                  {canEdit(item.status) && (
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {item.status !== "sent" && item.status !== "cancelled" && (
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="Cancelar ou excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Cancelar automação?"
        description="Campanhas agendadas serão canceladas. Rascunhos serão excluídos."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <CampaignEmailPreviewModal
        open={showPreviewModal}
        title={form.title}
        htmlBody={form.html_body}
        onClose={() => setShowPreviewModal(false)}
      />
    </div>
  );
}
