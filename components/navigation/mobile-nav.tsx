"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  BookOpen,
  ArrowLeftRight,
  HelpCircle,
  Target,
  Trophy,
  User,
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
  { href: "/trocas", label: "Trocas", icon: ArrowLeftRight },
  { href: "/quiz", label: "Quizz", icon: HelpCircle },
  { href: "/missoes", label: "Missões", icon: Target },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação"
      className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-8 px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] sm:px-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 touch-manipulation flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-1 transition-colors duration-200",
                  isActive
                    ? "text-verde-500"
                    : "text-verde-escuro-500/60 active:text-verde-escuro-500/80",
                )}
              >
                {isActive ? (
                  <span
                    className="absolute inset-x-1 top-0 h-0.5 rounded-full bg-verde-500"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  aria-hidden
                  className="size-5 shrink-0"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span
                  className={cn(
                    "block w-full truncate text-center text-[8px] font-medium leading-none tracking-tight xs:text-[9px]",
                    isActive && "font-bold",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
