"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
}

export function NavItem({ href, label }: NavItemProps) {
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
        "border-b-2 px-3 py-1.5 text-sm transition-colors duration-200",
        isActive
          ? "border-verde-escuro-500 font-bold text-verde-escuro-500"
          : "border-transparent font-medium text-verde-500 hover:text-verde-escuro-500",
      )}
    >
      {label}
    </Link>
  );
}
