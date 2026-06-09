import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavItem } from "@/components/navigation/nav-item";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";

const NAV = [
  { href: "/dashboard",  label: "Início" },
  { href: "/pacotinhos", label: "Pacotinhos" },
  { href: "/album",      label: "Álbum" },
  { href: "/colecao",    label: "Coleção" },
  { href: "/trocas",     label: "Trocas" },
  { href: "/quiz",       label: "Quiz" },
  { href: "/missoes",    label: "Missões" },
  { href: "/perfil",     label: "Perfil" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
          {/* Wordmark */}
          <Link
            href="/dashboard"
            className="flex shrink-0 flex-col leading-none"
            aria-label="Álbum GB — início"
          >
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-gb-green sm:text-[11px]">
              Grupo Boticário
            </span>
            <span className="font-display text-base font-semibold text-gb-green-deep sm:text-lg">
              <span className="sm:hidden">Álbum GB</span>
              <span className="hidden sm:inline">Álbum de Figurinhas</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          {/* Right side: link to perfil + sign out */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/perfil"
              aria-label="Meu perfil"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gb-slate transition-colors hover:text-gb-ink md:flex"
            >
              <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5"/></svg>
              Perfil
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 md:pb-8"
        tabIndex={-1}
      >
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
