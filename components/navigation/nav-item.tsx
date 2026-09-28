"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  featured?: boolean;
}

export function NavItem({ href, label, featured = false }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "px-3 py-1.5 transition-colors duration-200",
        featured
          ? cn(
              "shrink-0 whitespace-nowrap rounded-pill bg-amarelo px-3 py-1 text-sm font-bold leading-none text-verde-escuro-500 hover:brightness-95",
              isActive && "outline outline-2 outline-offset-1 outline-verde-escuro-500/20",
            )
          : cn(
              "border-b-2 text-sm",
              isActive
                ? "border-verde-escuro-500 font-bold text-verde-escuro-500"
                : "border-transparent font-medium text-verde-500 hover:text-verde-escuro-500",
            ),
      )}
    >
      {label}
    </Link>
  );
}
