import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavItem } from "@/components/navigation/nav-item";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Wordmark } from "@/components/brand/wordmark";

const NAV = [
  { href: "/dashboard",  label: "Início" },
  { href: "/pacotinhos", label: "Pacotinhos" },
  { href: "/album",      label: "Álbum" },
  { href: "/colecao",    label: "Coleção" },
  { href: "/trocas",     label: "Trocas" },
  { href: "/quiz",       label: "Quizz" },
  { href: "/missoes",    label: "Missões" },
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
        <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between gap-6 px-6 md:px-12 2xl:px-[120px]">
          {/* Marca */}
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center"
            aria-label="Fãs da Natureza — início"
          >
            <Wordmark tone="dark" />
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

          {/* Lado direito: perfil + sair */}
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/perfil"
              aria-label="Meu perfil"
              className="hidden items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-verde-500/10 md:flex"
            >
              <User aria-hidden className="size-4" strokeWidth={1.8} />
              Perfil
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1680px] flex-1 px-6 py-8 pb-24 md:px-12 md:pb-8 2xl:px-[120px]"
        tabIndex={-1}
      >
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
