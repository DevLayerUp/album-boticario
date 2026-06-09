import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { User, Calendar, Package, Star } from "lucide-react";

export const metadata: Metadata = { title: "Meu Perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { count: totalStickers }, { count: totalPacks }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, sticker_url, created_at")
        .eq("id", user.id)
        .single(),
      supabase
        .from("user_stickers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gt("quantity", 0),
      supabase
        .from("packs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("opened_at", "is", null),
    ]);

  const name =
    profile?.display_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Colecionador";

  const joinedAt = profile?.created_at
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
        new Date(profile.created_at)
      )
    : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-gb-ink">
          Meu Perfil
        </h1>
        <p className="mt-1 text-sm text-gb-slate">
          Suas informações e conquistas na coleção.
        </p>
      </div>

      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        {/* Banner */}
        <div
          aria-hidden
          className="h-24 bg-gradient-to-br from-gb-green-deep via-gb-green-dark to-gb-green"
        />

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-surface shadow-md">
              {profile?.sticker_url ? (
                <Image
                  src={profile.sticker_url}
                  alt={`Figurinha de ${name}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gb-green-deep">
                  <User size={36} className="text-gb-green opacity-70" />
                </div>
              )}
            </div>
            <div className="pb-1">
              <h2 className="font-display text-xl font-semibold text-gb-ink">
                {name}
              </h2>
              <p className="text-sm text-gb-slate">{user.email}</p>
            </div>
          </div>

          {joinedAt && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gb-slate">
              <Calendar size={14} aria-hidden />
              <span>Membro desde {joinedAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-2 gap-4">
        {[
          { icon: Star, label: "Figurinhas", value: totalStickers ?? 0, href: "/colecao" },
          { icon: Package, label: "Pacotinhos abertos", value: totalPacks ?? 0, href: "/pacotinhos" },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md focus-visible:outline-2"
          >
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gb-slate">
              <Icon size={14} aria-hidden />
              {label}
            </dt>
            <dd className="font-display text-3xl font-bold text-gb-ink">
              {value}
            </dd>
          </Link>
        ))}
      </dl>

      {/* Actions */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-gb-ink">Ações</h3>

        <Link
          href="/figurinha"
          className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium text-gb-ink transition-colors hover:bg-background focus-visible:outline-2"
        >
          <span>Atualizar minha figurinha</span>
          <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12l4-4-4-4"/></svg>
        </Link>

        <div className="pt-1">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
