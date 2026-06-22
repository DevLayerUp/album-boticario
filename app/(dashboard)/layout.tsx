import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavItem } from "@/components/navigation/nav-item";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardBrandLogos } from "@/components/dashboard/dashboard-brand-logos";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardMain } from "@/components/dashboard/dashboard-main";
import { ReferralClaimOnLoad } from "@/components/referral/referral-claim-on-load";
import { FirstStepsOnLoad } from "@/components/first-steps/first-steps-on-load";
import { NotificationBell } from "@/components/notifications/notification-bell";

const NAV = [
  { href: "/dashboard",  label: "Início" },
  { href: "/pacotinhos", label: "Pacotinhos" },
  { href: "/album",      label: "Álbum" },
  { href: "/trocas",     label: "Trocas" },
  { href: "/quiz",       label: "Quizz" },
  { href: "/missoes",    label: "Missões" },
  { href: "/ranking",    label: "Ranking" },
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
    <DashboardShell>
      <ReferralClaimOnLoad />
      <FirstStepsOnLoad />
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1680px] items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 md:px-12 2xl:px-[120px]">
          <DashboardBrandLogos />

          <nav
            aria-label="Navegação principal"
            className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden"
          >
            {NAV.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <NotificationBell />
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

      <DashboardMain>{children}</DashboardMain>

      <MobileNav />
    </DashboardShell>
  );
}
