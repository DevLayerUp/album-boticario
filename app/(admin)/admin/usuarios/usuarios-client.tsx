"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Package, CheckCircle2, Loader2 } from "lucide-react";

interface User {
  id: string;
  display_name: string | null;
  username: string | null;
  sticker_url: string | null;
  created_at: string;
  email: string | null;
}

export function UsuariosClient({ initialUsers }: { initialUsers: User[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "sticker" | "no-sticker">("all");
  const [grantUserId, setGrantUserId] = useState<string | null>(null);
  const [grantQty, setGrantQty] = useState(1);
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState<string | null>(null);

  const filtered = initialUsers.filter((u) => {
    const matchSearch =
      !search ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "sticker" && !!u.sticker_url) ||
      (filter === "no-sticker" && !u.sticker_url);

    return matchSearch && matchFilter;
  });

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
        <p className="text-sm text-gray-500">{filtered.length} usuário(s)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-gb-green w-64"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green"
        >
          <option value="all">Todos</option>
          <option value="sticker">Com figurinha</option>
          <option value="no-sticker">Sem figurinha</option>
        </select>
      </div>

      {/* Grant pack panel */}
      {grantUserId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-amber-900">
            Conceder pacotinhos para:{" "}
            <span className="font-normal">
              {initialUsers.find((u) => u.id === grantUserId)?.display_name ?? grantUserId}
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
              {granting ? <Loader2 size={13} className="animate-spin" /> : <Package size={13} />}
              Conceder
            </button>
            <button
              onClick={() => { setGrantUserId(null); setGrantMsg(null); }}
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
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
                <th className="px-4 py-3 text-left">Cadastro</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.sticker_url ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                          <Image src={u.sticker_url} alt="" fill className="object-cover" />
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
    </div>
  );
}
