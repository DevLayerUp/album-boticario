"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  BookOpen,
  LayoutGrid,
  ArrowLeftRight,
  HelpCircle,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: MobileNavLink[] = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/pacotinhos", label: "Pacotinhos", icon: Package },
  { href: "/album", label: "Álbum", icon: BookOpen },
  { href: "/colecao", label: "Coleção", icon: LayoutGrid },
  { href: "/trocas", label: "Trocas", icon: ArrowLeftRight },
  { href: "/quiz", label: "Quizz", icon: HelpCircle },
  { href: "/missoes", label: "Missões", icon: Target },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação"
      className="sticky bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur md:hidden"
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === href
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-1.5 text-[10px] font-medium transition-colors duration-200",
              isActive
                ? "font-bold text-verde-500"
                : "text-verde-escuro-500/60",
            )}
          >
            <Icon
              aria-hidden
              className={cn(
                "size-[22px] transition-transform duration-200",
                isActive && "scale-110",
              )}
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
