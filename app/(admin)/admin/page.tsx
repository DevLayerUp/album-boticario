import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Image,
  Tag,
  HelpCircle,
  Target,
  Users,
  Package,
} from "lucide-react";

export const metadata: Metadata = { title: "Visão Geral" };

async function getStats() {
  const supabase = createAdminClient();
  const [stickers, categories, quizzes, missions, profiles, packs] =
    await Promise.all([
      supabase.from("stickers").select("id", { count: "exact", head: true }),
      supabase.from("sticker_categories").select("id", { count: "exact", head: true }),
      supabase.from("quizzes").select("id", { count: "exact", head: true }),
      supabase.from("missions").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("packs")
        .select("id", { count: "exact", head: true })
        .is("opened_at", null),
    ]);

  return {
    stickers: stickers.count ?? 0,
    categories: categories.count ?? 0,
    quizzes: quizzes.count ?? 0,
    missions: missions.count ?? 0,
    users: profiles.count ?? 0,
    pendingPacks: packs.count ?? 0,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Figurinhas",
      value: stats.stickers,
      icon: Image,
      href: "/admin/figurinhas",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Categorias",
      value: stats.categories,
      icon: Tag,
      href: "/admin/categorias",
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Perguntas Quiz",
      value: stats.quizzes,
      icon: HelpCircle,
      href: "/admin/quiz",
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Missões",
      value: stats.missions,
      icon: Target,
      href: "/admin/missoes",
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Usuários",
      value: stats.users,
      icon: Users,
      href: "/admin/usuarios",
      color: "text-rose-600 bg-rose-50",
    },
    {
      label: "Packs pendentes",
      value: stats.pendingPacks,
      icon: Package,
      href: "/admin/usuarios",
      color: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Visão Geral</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumo do conteúdo do programa Álbum de Figurinhas GB
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {value}
                </p>
              </div>
              <span className={`rounded-lg p-2 ${color}`}>
                <Icon size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Ações rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/figurinhas/nova"
            className="rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gb-green-dark"
          >
            + Nova figurinha
          </Link>
          <Link
            href="/admin/categorias"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Gerenciar categorias
          </Link>
          <Link
            href="/admin/quiz/novo"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            + Nova pergunta quiz
          </Link>
          <Link
            href="/admin/raridades"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Configurar raridades
          </Link>
        </div>
      </div>
    </div>
  );
}
