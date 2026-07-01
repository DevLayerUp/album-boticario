"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import {
  USER_FEEDBACK_TYPE_LABELS,
  USER_FEEDBACK_TYPES,
  type UserFeedbackType,
} from "@/lib/user-feedback";

export interface AdminFeedbackRow {
  id: number;
  user_id: string;
  type: UserFeedbackType;
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
  const [items] = useState(initialData);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | UserFeedbackType>("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      if (!matchesType) return false;

      const haystack = [
        item.message,
        item.display_name,
        item.username,
        item.email,
        USER_FEEDBACK_TYPE_LABELS[item.type],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search.toLowerCase());
    });
  }, [items, search, typeFilter]);

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
      </div>

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
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {userLabel(item)}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {item.email ?? "sem e-mail"} · {formatDate(item.created_at)}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TYPE_BADGE[item.type]}`}
                >
                  {USER_FEEDBACK_TYPE_LABELS[item.type]}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {item.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
