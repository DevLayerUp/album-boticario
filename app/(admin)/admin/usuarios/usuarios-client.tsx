"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Package,
  CheckCircle2,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { AdminUsuarioRow } from "@/lib/admin-usuarios-list";

type StickerFilter = "all" | "sticker" | "no-sticker";

export function UsuariosClient() {
  const [users, setUsers] = useState<AdminUsuarioRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<StickerFilter>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [confirmRole, setConfirmRole] = useState<{
    user: AdminUsuarioRow;
    nextIsAdmin: boolean;
  } | null>(null);
  const [grantUserId, setGrantUserId] = useState<string | null>(null);
  const [grantQty, setGrantQty] = useState(1);
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        filter,
      });
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const res = await fetch(`/api/admin/usuarios?${params}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao carregar usuários");
      }

      setUsers(data.users ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  async function handleExportCsv() {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/admin/usuarios/export");
      if (!res.ok) {
        let message = "Falha ao exportar";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // resposta sem JSON
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : "Erro ao exportar");
    } finally {
      setExporting(false);
    }
  }

  function handleToggleAdmin(user: AdminUsuarioRow, nextIsAdmin: boolean) {
    setConfirmRole({ user, nextIsAdmin });
  }

  async function confirmRoleChange() {
    if (!confirmRole) return;
    const { user, nextIsAdmin } = confirmRole;

    setRoleUpdatingId(user.id);
    try {
      const res = await fetch("/api/admin/usuarios/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, is_admin: nextIsAdmin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao atualizar");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_admin: Boolean(data.is_admin) } : u,
        ),
      );
      setConfirmRole(null);
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : "Erro ao atualizar acesso");
    } finally {
      setRoleUpdatingId(null);
    }
  }

  async function handleGrantPack() {
    if (!grantUserId) return;
    setGranting(true);
    setGrantMsg(null);
    try {
      const res = await fetch("/api/admin/grant-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: grantUserId, quantity: grantQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGrantMsg(`${data.granted} pacotinho(s) concedido(s) com sucesso!`);
    } catch (err: unknown) {
      setGrantMsg(err instanceof Error ? err.message : "Erro ao conceder");
    } finally {
      setGranting(false);
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * 100 + 1;
  const rangeEnd = Math.min(page * 100, total);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500">
            {total.toLocaleString("pt-BR")} usuário(s) no total
            {total > 0 && (
              <> · exibindo {rangeStart}–{rangeEnd}</>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-gb-green bg-gb-green px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Exportar CSV
          </button>
          {exportError && (
            <p className="text-xs text-red-600">{exportError}</p>
          )}
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
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-gb-green"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StickerFilter)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green"
        >
          <option value="all">Todos</option>
          <option value="sticker">Com figurinha</option>
          <option value="no-sticker">Sem figurinha</option>
        </select>
      </div>

      {grantUserId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-amber-900">
            Conceder pacotinhos para:{" "}
            <span className="font-normal">
              {users.find((u) => u.id === grantUserId)?.display_name ?? grantUserId}
            </span>
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={50}
              value={grantQty}
              onChange={(e) => setGrantQty(Number(e.target.value))}
              className="w-20 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-400"
            />
            <span className="text-sm text-amber-800">pacotinhos</span>
            <button
              onClick={handleGrantPack}
              disabled={granting}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
            >
              {granting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Package size={13} />
              )}
              Conceder
            </button>
            <button
              onClick={() => {
                setGrantUserId(null);
                setGrantMsg(null);
              }}
              className="text-xs text-amber-700 hover:underline"
            >
              Cancelar
            </button>
          </div>
          {grantMsg && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-900">
              <CheckCircle2 size={13} /> {grantMsg}
            </p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Carregando usuários…
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void fetchUsers()}
              className="mt-3 text-sm font-medium text-gb-green hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Usuário</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Figurinha</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-left">Cadastro</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.sticker_url ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src={u.sticker_url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-400">
                          {(u.display_name ?? u.email ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {u.display_name ?? "—"}
                        </p>
                        {u.username && (
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {u.sticker_url ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle2 size={11} /> Criada
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={u.is_admin}
                      aria-label={u.is_admin ? "Remover admin" : "Tornar admin"}
                      disabled={roleUpdatingId === u.id}
                      onClick={() => handleToggleAdmin(u, !u.is_admin)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                        u.is_admin ? "bg-gb-green" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                          u.is_admin ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setGrantUserId(u.id);
                        setGrantMsg(null);
                        setGrantQty(1);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                    >
                      <Package size={12} /> Dar packs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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

      {confirmRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => roleUpdatingId === null && setConfirmRole(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {confirmRole.nextIsAdmin
                ? "Tornar administrador"
                : "Remover acesso de admin"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {confirmRole.nextIsAdmin ? (
                <>
                  Tem certeza que quer transformar{" "}
                  <span className="font-semibold text-gray-900">
                    {confirmRole.user.display_name ??
                      confirmRole.user.email ??
                      "esta pessoa"}
                  </span>{" "}
                  em administrador? Ela terá acesso total ao painel.
                </>
              ) : (
                <>
                  Tem certeza que quer remover o acesso de administrador de{" "}
                  <span className="font-semibold text-gray-900">
                    {confirmRole.user.display_name ??
                      confirmRole.user.email ??
                      "esta pessoa"}
                  </span>
                  ?
                </>
              )}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmRole(null)}
                disabled={roleUpdatingId !== null}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => void confirmRoleChange()}
                disabled={roleUpdatingId !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {roleUpdatingId !== null && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
