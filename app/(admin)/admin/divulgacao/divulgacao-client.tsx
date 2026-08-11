"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Shirt,
  Users,
} from "lucide-react";
import type { AdminDivulgacaoRow } from "@/lib/admin-divulgacao";
import { ADMIN_DIVULGACAO_PAGE_SIZE } from "@/lib/admin-divulgacao";

export function DivulgacaoClient() {
  const [collaborators, setCollaborators] = useState<AdminDivulgacaoRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [collaboratorCount, setCollaboratorCount] = useState(0);
  const [totalCompleteInvites, setTotalCompleteInvites] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ADMIN_DIVULGACAO_PAGE_SIZE),
      });
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const res = await fetch(`/api/admin/divulgacao?${params}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao carregar divulgação");
      }

      setCollaborators(data.collaborators ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setCollaboratorCount(data.summary?.collaborator_count ?? 0);
      setTotalCompleteInvites(data.summary?.total_complete_invites ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão");
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const rankOffset = (page - 1) * ADMIN_DIVULGACAO_PAGE_SIZE;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Divulgação
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Colaboradores elegíveis ao programa (e-mails corporativos), ordenados
          por convites válidos após o lançamento da campanha (contagem
          independente de &quot;Convidar amigos&quot;). Os 3 primeiros ganham a
          camiseta.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <Users size={14} />
            Colaboradores ativos
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-950">
            {collaboratorCount}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <Shirt size={14} />
            Cadastros completos (total)
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-950">
            {totalCompleteInvites}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-gb-green"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Carregando colaboradores…
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void fetchRows()}
              className="mt-3 text-sm font-medium text-gb-green hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : collaborators.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Nenhum colaborador encontrado para o programa.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-center">#</th>
                <th className="px-4 py-3 text-left">Colaborador</th>
                <th className="px-4 py-3 text-left">E-mail</th>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-center">Cadastros</th>
                <th className="px-4 py-3 text-center">Completos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collaborators.map((row, index) => {
                const rank = rankOffset + index + 1;
                const isTop3 = rank <= 3 && row.complete_invites > 0;
                return (
                  <tr
                    key={row.id}
                    className={
                      isTop3 ? "bg-amber-50/60 hover:bg-amber-50" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          isTop3
                            ? "inline-flex size-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white"
                            : "text-gray-500"
                        }
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
                          {row.sticker_url ? (
                            <Image
                              src={row.sticker_url}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center text-xs font-semibold text-gray-400">
                              {(row.display_name ?? row.email).slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {row.display_name ?? "Sem nome"}
                          </p>
                          {row.username ? (
                            <p className="truncate text-xs text-gray-500">
                              @{row.username}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3">
                      {row.referral_code ? (
                        <span className="font-mono text-xs text-gray-700">
                          {row.referral_code}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {row.total_signups}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gb-green/10 px-2.5 py-0.5 text-sm font-semibold text-gb-green-deep">
                        {row.complete_invites}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 || total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            {total} colaborador(es)
            {debouncedSearch.trim() ? " na busca" : ""} · página {page} de{" "}
            {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
