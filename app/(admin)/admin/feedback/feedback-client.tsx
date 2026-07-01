"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageSquare, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  USER_FEEDBACK_STATUS_LABELS,
  USER_FEEDBACK_STATUSES,
  USER_FEEDBACK_TYPE_LABELS,
  USER_FEEDBACK_TYPES,
  type UserFeedbackStatus,
  type UserFeedbackType,
} from "@/lib/user-feedback";

export interface AdminFeedbackRow {
  id: number;
  user_id: string;
  type: UserFeedbackType;
  status: UserFeedbackStatus;
  message: string;
  created_at: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
}

const TYPE_BADGE: Record<UserFeedbackType, string> = {
  bug: "bg-red-50 text-red-700 ring-red-200",
  suggestion: "bg-sky-50 text-sky-700 ring-sky-200",
  praise: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  other: "bg-gray-100 text-gray-700 ring-gray-200",
};

const STATUS_BADGE: Record<UserFeedbackStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  in_progress: "bg-blue-50 text-blue-800 ring-blue-200",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  dismissed: "bg-gray-100 text-gray-600 ring-gray-200",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function userLabel(row: AdminFeedbackRow) {
  return row.display_name ?? row.username ?? row.email ?? row.user_id.slice(0, 8);
}

export function FeedbackAdminClient({ initialData }: { initialData: AdminFeedbackRow[] }) {
  const [items, setItems] = useState(initialData);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | UserFeedbackType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserFeedbackStatus>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteTarget = deleteId ? items.find((item) => item.id === deleteId) : null;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      if (!matchesType || !matchesStatus) return false;

      const haystack = [
        item.message,
        item.display_name,
        item.username,
        item.email,
        USER_FEEDBACK_TYPE_LABELS[item.type],
        USER_FEEDBACK_STATUS_LABELS[item.status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search.toLowerCase());
    });
  }, [items, search, typeFilter, statusFilter]);

  async function handleStatusChange(id: number, status: UserFeedbackStatus) {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Não foi possível atualizar o status.");

      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback/${deleteId}`, { method: "DELETE" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Não foi possível excluir.");

      setItems((current) => current.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir feedback.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Feedbacks</h1>
          <p className="text-sm text-gray-500">
            {filtered.length} de {items.length} mensagem(ns) dos usuários
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar por mensagem, nome ou e-mail…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-72 rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-gb-green"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green"
        >
          <option value="all">Todos os tipos</option>
          {USER_FEEDBACK_TYPES.map((type) => (
            <option key={type} value={type}>
              {USER_FEEDBACK_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green"
        >
          <option value="all">Todos os status</option>
          {USER_FEEDBACK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {USER_FEEDBACK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <MessageSquare className="mx-auto size-8 text-gray-300" aria-hidden />
          <p className="mt-3 text-sm font-medium text-gray-700">Nenhum feedback encontrado</p>
          <p className="mt-1 text-sm text-gray-500">
            Os envios dos usuários pela dashboard aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {userLabel(item)}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {item.email ?? "sem e-mail"} · {formatDate(item.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TYPE_BADGE[item.type]}`}
                  >
                    {USER_FEEDBACK_TYPE_LABELS[item.type]}
                  </span>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE[item.status]}`}
                  >
                    {USER_FEEDBACK_STATUS_LABELS[item.status]}
                  </span>

                  <div className="relative">
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(event) =>
                        void handleStatusChange(item.id, event.target.value as UserFeedbackStatus)
                      }
                      aria-label={`Alterar status do feedback de ${userLabel(item)}`}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-gb-green disabled:opacity-50"
                    >
                      {USER_FEEDBACK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {USER_FEEDBACK_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    {updatingId === item.id ? (
                      <Loader2
                        size={12}
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                        aria-hidden
                      />
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Excluir feedback de ${userLabel(item)}`}
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {item.message}
              </p>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir feedback"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir o feedback de ${userLabel(deleteTarget)}? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita."
        }
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setDeleteId(null);
        }}
      />
    </div>
  );
}
