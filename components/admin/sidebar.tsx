"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  LayoutGrid,
  Image,
  Tag,
  Layers,
  BookOpen,
  HelpCircle,
  Target,
  Users,
  Megaphone,
  MessageSquare,
  LogOut,
  ChevronRight,
  ImageIcon,
  Globe,
  Package,
  Sparkles,
  Search,
  Mail,
} from "lucide-react";

const NAV = [
  { href: "/admin",              label: "Visão Geral",   icon: LayoutDashboard, exact: true },
  { href: "/admin/landing",      label: "Landing Page",  icon: Globe },
  { href: "/admin/seo",          label: "SEO",           icon: Search },
  { href: "/admin/first-steps",  label: "Primeiros Passos", icon: Sparkles },
  { href: "/admin/dashboard-cards", label: "Cards Dashboard", icon: LayoutGrid },
  { href: "/admin/album-capa",   label: "Capa do Álbum", icon: ImageIcon },
  { href: "/admin/pacotinhos",   label: "Pacotinhos",    icon: Package },
  { href: "/admin/categorias",   label: "Categorias",    icon: Tag },
  { href: "/admin/paginas",      label: "Páginas",       icon: BookOpen },
  { href: "/admin/figurinhas",   label: "Figurinhas",    icon: Image },
  { href: "/admin/raridades",    label: "Raridades",     icon: Layers },
  { href: "/admin/quiz",         label: "Quiz",          icon: HelpCircle },
  { href: "/admin/missoes",      label: "Missões",       icon: Target },
  { href: "/admin/avisos",       label: "Avisos",        icon: Megaphone },
  { href: "/admin/automacoes-email", label: "E-mails", icon: Mail },
  { href: "/admin/feedback",     label: "Feedbacks",     icon: MessageSquare },
  { href: "/admin/usuarios",     label: "Usuários",      icon: Users },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-gb-green-deep">
      {/* brand */}
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gb-green">
          Grupo Boticário
        </p>
        <p className="mt-0.5 font-display text-[15px] font-semibold text-white">
          Admin Dashboard
        </p>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-gb-green/15 text-gb-green"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={16}
                    className={active ? "text-gb-green" : "text-white/40 group-hover:text-white/70"}
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <ChevronRight size={12} className="text-gb-green/70" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* user + logout */}
      <div className="border-t border-white/10 px-5 py-4">
        <p className="mb-3 truncate text-xs font-medium text-white/50">
          {adminName}
        </p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white/80"
        >
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </aside>
  );
}
