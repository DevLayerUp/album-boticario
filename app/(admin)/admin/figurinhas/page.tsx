import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { FigurinhasFilters } from "./figurinhas-filters";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Figurinhas" };
export const dynamic = "force-dynamic";

export default async function FigurinhasPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; rarity?: string; active?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  const [stickersRes, catsRes, raritiesRes] = await Promise.all([
    supabase
      .from("stickers")
      .select(`*, sticker_categories(id, name), rarities(id, name, color_hex)`)
      .order("id", { ascending: false }),
    supabase.from("sticker_categories").select("id, name").order("sort_order"),
    supabase.from("rarities").select("id, name, color_hex").order("id"),
  ]);

  let stickers = stickersRes.data ?? [];

  // Client-side filter (could also do server-side via query params)
  if (params.category) {
    stickers = stickers.filter((s) => String(s.category_id) === params.category);
  }
  if (params.rarity) {
    stickers = stickers.filter((s) => String(s.rarity_id) === params.rarity);
  }
  if (params.active !== undefined) {
    const activeVal = params.active === "true";
    stickers = stickers.filter((s) => s.is_active === activeVal);
  }

  const categories = catsRes.data ?? [];
  const rarities = raritiesRes.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Figurinhas</h1>
          <p className="text-sm text-gray-500">{stickers.length} figurinha(s)</p>
        </div>
        <Link
          href="/admin/figurinhas/nova"
          className="flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white hover:bg-gb-green-dark"
        >
          <Plus size={15} /> Nova figurinha
        </Link>
      </div>

      <FigurinhasFilters categories={categories} rarities={rarities} />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {stickers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Nenhuma figurinha encontrada.{" "}
            <Link href="/admin/figurinhas/nova" className="text-gb-green hover:underline">
              Criar primeira
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Imagem</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Raridade</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stickers.map((s) => {
                const cat = s.sticker_categories as { name: string } | null;
                const rar = s.rarities as { name: string; color_hex: string } | null;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {s.image_url && (
                          <Image src={s.image_url} alt={s.name} fill className="object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{cat?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {rar ? (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: rar.color_hex }}
                        >
                          {rar.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {s.is_user_type ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                          Usuário
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/figurinhas/${s.id}`}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
