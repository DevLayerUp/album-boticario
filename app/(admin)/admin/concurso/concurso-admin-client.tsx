"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  Trophy,
  X,
} from "lucide-react";
import type { AdminContestEntry } from "@/lib/admin-concurso-list";
import { formatCpf } from "@/lib/concurso";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ConcursoAdminClient({ embedded = false }: { embedded?: boolean }) {
  const [entries, setEntries] = useState<AdminContestEntry[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminContestEntry | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await fetch(`/api/admin/concurso?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar inscrições");

      setEntries(data.entries ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setLimit(data.pagination?.limit ?? 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Concurso Cultural</h1>
            <p className="text-sm text-gray-500">
              {total.toLocaleString("pt-BR")} resposta(s)
              {total > 0 && (
                <> · exibindo {rangeStart}–{rangeEnd}</>
              )}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          {total.toLocaleString("pt-BR")} resposta(s)
          {total > 0 && (
            <> · exibindo {rangeStart}–{rangeEnd}</>
          )}
        </p>
      )}

      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar por nome, e-mail, CPF ou resposta…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-gb-green"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Carregando…
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Trophy className="mx-auto size-8 text-gray-300" aria-hidden />
            <p className="mt-3 text-sm font-medium text-gray-700">Nenhuma inscrição encontrada</p>
            <p className="mt-1 text-sm text-gray-500">
              As respostas enviadas na página do concurso aparecerão aqui.
            </p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Enviado em</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Resposta</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="cursor-pointer hover:bg-gray-50/80"
                  onClick={() => setSelected(entry)}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 font-medium text-gray-900">
                    {entry.full_name}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-gray-600">
                    {entry.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                    {formatCpf(entry.cpf_digits)}
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-gray-600">
                    {entry.answer}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(entry);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gb-green-dark hover:bg-gb-green/10"
                    >
                      <Eye size={13} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
            >
              Próxima
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selected ? (
        <EntryDetailModal entry={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function EntryDetailModal({
  entry,
  onClose,
}: {
  entry: AdminContestEntry;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="concurso-entry-title"
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="concurso-entry-title" className="font-display text-base font-semibold text-gray-900">
              Inscrição #{entry.id}
            </h2>
            <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <DetailField label="Nome" value={entry.full_name} />
          <DetailField label="E-mail" value={entry.email} />
          <DetailField label="Celular" value={entry.phone} />
          <DetailField label="CPF" value={formatCpf(entry.cpf_digits)} />
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Resposta
            </p>
            <p className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
              {entry.answer}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 font-medium ring-1 ${
                entry.accepted_rules
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-gray-100 text-gray-500 ring-gray-200"
              }`}
            >
              {entry.accepted_rules ? "Regulamento aceito" : "Regulamento não aceito"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 font-medium ring-1 ${
                entry.accepted_data
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-gray-100 text-gray-500 ring-gray-200"
              }`}
            >
              {entry.accepted_data ? "Uso de dados autorizado" : "Uso de dados não autorizado"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
