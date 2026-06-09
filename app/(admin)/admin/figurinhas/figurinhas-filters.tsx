"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  categories: Array<{ id: number; name: string }>;
  rarities: Array<{ id: number; name: string; color_hex: string }>;
}

export function FigurinhasFilters({ categories, rarities }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green"
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("rarity") ?? ""}
        onChange={(e) => setParam("rarity", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green"
      >
        <option value="">Todas as raridades</option>
        {rarities.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("active") ?? ""}
        onChange={(e) => setParam("active", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gb-green"
      >
        <option value="">Todos os status</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
    </div>
  );
}
