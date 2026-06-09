"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/dashboard",
    label: "Início",
    icon: (
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/album",
    label: "Álbum",
    icon: (
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 6a2 2 0 0 1 2-2h7l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z" />
        <path d="M12 11v4M10 13h4" />
      </svg>
    ),
  },
  {
    href: "/colecao",
    label: "Coleção",
    icon: (
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/quiz",
    label: "Quiz",
    icon: (
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r=".5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/trocas",
    label: "Trocas",
    icon: (
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação"
      className="sticky bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur md:hidden"
    >
      {NAV.map(({ href, label, icon }) => {
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
              "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-2 text-[10px] font-semibold transition-colors duration-200",
              isActive ? "text-gb-green" : "text-gb-slate",
            )}
          >
            <span
              className={cn(
                "transition-transform duration-200",
                isActive && "scale-110",
              )}
            >
              {icon}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
